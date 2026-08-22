import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Eye, Calendar, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRegion } from "@/lib/region.server";
import { getListingBySlug, getMarketplaceListings } from "@/lib/queries";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingContact } from "@/components/listings/listing-contact";
import { ShareButtons } from "@/components/collection/share-buttons";
import { CategoryBrowse } from "@/components/marketplace/category-browse";
import { getCategoryListings } from "@/lib/marketplace.server";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbJsonLd,
  buildOpenGraph,
  clampDescription,
  listingJsonLd,
  siteUrlForRegion,
} from "@/lib/seo";
import { recordViewDebounced } from "@/lib/view-counter";
import {
  categoryBySlug,
  categoryByValue,
  categoryMetaDescription,
  categoryMetaTitle,
  cityOf,
  formatListingPrice,
  listingImageAlt,
  listingMetaDescription,
  listingSeoTitle,
  resolvePlace,
  withBrand,
  type SeoListing,
} from "@/lib/marketplace";

export const revalidate = 60;

/**
 * One dynamic segment serves two page types:
 *
 *   /marketplace/furniture              → the Furniture category landing page
 *   /marketplace/treated-cyprus-...-m3y → an individual listing
 *
 * They can't collide: every listing slug ends in a base-36 timestamp suffix
 * (see actions/listings.ts), so no listing can ever be named "furniture".
 * Keeping both under one segment is what makes /marketplace/furniture possible
 * at all — a sibling static route per category would be fourteen near-identical
 * files, and a nested /marketplace/category/... prefix buys nothing but depth.
 */
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegion();
  const origin = siteUrlForRegion(region);

  // --- Category landing page ------------------------------------------------
  const category = categoryBySlug(slug);
  if (category) {
    const listings = await getCategoryListings(region, category);
    return {
      title: { absolute: categoryMetaTitle(category) },
      description: clampDescription(categoryMetaDescription(category, null, listings.length), 160),
      alternates: { canonical: `${origin}/marketplace/${category.slug}` },
      // An empty category is thin content — crawlable and linked, but not
      // offered to the index until a seller actually posts into it.
      robots: listings.length === 0 ? { index: false, follow: true } : undefined,
      openGraph: buildOpenGraph({
        title: categoryMetaTitle(category),
        description: category.intro,
        path: `/marketplace/${category.slug}`,
        region,
      }),
    };
  }

  // --- Individual listing ---------------------------------------------------
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing not found", robots: { index: false, follow: true } };

  const seo = listing as unknown as SeoListing;
  // The listing belongs to the market its price is denominated in, so its
  // canonical must live on that market's own host — not whichever host the
  // request arrived on.
  const listingOrigin = siteUrlForRegion(listing.currency === "USD" ? "virginia" : "kenya");
  const title = listingSeoTitle(seo);
  const description = clampDescription(listingMetaDescription(seo), 160);

  return {
    // `absolute` so the layout's " · The Estate Edit" suffix can't push a
    // title that already names the product, the intent and the place past what
    // Google displays. The brand is re-added only if it still fits.
    title: { absolute: withBrand(title) },
    description,
    alternates: { canonical: `${listingOrigin}/marketplace/${slug}` },
    openGraph: buildOpenGraph({
      title: `${title} — ${formatListingPrice(listing.price, listing.currency)}`,
      description,
      path: `/marketplace/${slug}`,
      type: "article",
      region: listing.currency === "USD" ? "virginia" : "kenya",
      images: listing.primary_image_url
        ? [{ url: listing.primary_image_url, width: 1200, height: 900, alt: listingImageAlt(seo) }]
        : undefined,
    }),
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${formatListingPrice(listing.price, listing.currency)}`,
      description,
      ...(listing.primary_image_url ? { images: [listing.primary_image_url] } : {}),
    },
  };
}

export default async function MarketplaceSlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const region = await getRegion();

  // Category landing page.
  const category = categoryBySlug(slug);
  if (category) {
    const listings = await getCategoryListings(region, category);
    return <CategoryBrowse category={category} place={null} listings={listings} region={region} />;
  }

  return <ListingDetail slug={slug} />;
}

/* -------------------------------------------------------------------------- */
/* Listing detail                                                              */
/* -------------------------------------------------------------------------- */

async function ListingDetail({ slug }: { slug: string }) {
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  // Counts every human page load, signed in or not. Two things make that work:
  // the write goes through the service-role client (RLS only lets a listing's
  // OWNER update the row, so the old cookie-client write was silently rejected
  // for every visitor who wasn't the seller), and the addition happens inside
  // Postgres (see increment_listing_views), so simultaneous viewers can't
  // overwrite each other's increment. Crawlers and link-preview bots are
  // filtered out in recordViewDebounced.
  void recordViewDebounced(listing.id, async (incrementBy) => {
    const { error } = await createAdminClient().rpc("increment_listing_views", {
      p_listing_id: listing.id,
      p_increment: incrementBy,
    });
    // Loud, not silent: if supabase/listing-views.sql hasn't been run yet the
    // function doesn't exist, and a dead view counter is invisible otherwise.
    if (error) console.error("increment_listing_views failed:", error.message);
  });

  const profile = listing.user_profiles;

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    isVa,
  ] = await Promise.all([supabase.auth.getUser(), getRegion().then((r) => r === "virginia")]);
  const isOwner = user?.id === listing.user_id;

  // Virginia sellers are contacted by email (no phone shown); Kenya keeps phone
  // (WhatsApp / call). The seller's email lives in auth.users, not the profile.
  let sellerEmail: string | null = null;
  if (isVa && !isOwner) {
    try {
      const admin = createAdminClient();
      const { data: authUser } = await admin.auth.admin.getUserById(listing.user_id);
      sellerEmail = authUser?.user?.email ?? null;
    } catch {
      sellerEmail = null;
    }
  }

  // Explicitly picked, not spread from the row: this object is handed to a
  // Client Component, so anything on it is serialised into the page payload.
  // The row carries the seller's phone number, which the Virginia flow
  // deliberately does not expose — spreading the whole row would ship it to the
  // browser anyway.
  const seo: SeoListing = {
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    currency: listing.currency,
    category: listing.category,
    condition: listing.condition,
    location: listing.location,
    primary_image_url: listing.primary_image_url,
  };
  const origin = siteUrlForRegion(listing.currency === "USD" ? "virginia" : "kenya");
  const url = `${origin}/marketplace/${listing.slug}`;
  const category = categoryByValue(listing.category);
  const place = resolvePlace(listing.location);
  const heading = listingSeoTitle(seo);
  const price = formatListingPrice(listing.price, listing.currency);

  // Home > Marketplace > Furniture > Nairobi > Ngong Road, Nairobi > item.
  // The city rung matters: it is the page with the search volume behind it, and
  // the one a redundant neighbourhood page canonicalises to.
  const city = place ? cityOf(place) : null;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    ...(category ? [{ name: category.label, path: `/marketplace/${category.slug}` }] : []),
    ...(category && city ? [{ name: city.label, path: `/marketplace/${category.slug}/${city.slug}` }] : []),
    ...(category && place?.slug
      ? [{ name: place.label, path: `/marketplace/${category.slug}/${place.slug}` }]
      : []),
    { name: listing.title },
  ];

  // Only fields the seller actually filled in — a spec row is never invented.
  const specs: { label: string; value: string }[] = [
    category && { label: "Category", value: category.label },
    listing.condition && {
      label: "Condition",
      value: listing.condition.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    },
    place && { label: "Location", value: place.label },
    { label: "Price", value: price },
    profile?.full_name && { label: "Seller", value: profile.full_name },
    {
      label: "Listed",
      value: new Date(listing.created_at).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
    { label: "Availability", value: "Available — enquire with the seller" },
  ].filter(Boolean) as { label: string; value: string }[];

  // Related listings: same category first (the genuinely comparable ones),
  // then anything else on the marketplace, so every listing page hands the
  // crawler four more listing URLs and the buyer four more options.
  const region = isVa ? "virginia" : "kenya";
  const sameCategory = category
    ? (await getMarketplaceListings(region, category.value, "")).filter(
        (l) => l.slug !== listing.slug,
      )
    : [];
  const fill =
    sameCategory.length >= 4
      ? []
      : (await getMarketplaceListings(region, "", "")).filter(
          (l) => l.slug !== listing.slug && !sameCategory.some((s) => s.slug === l.slug),
        );
  const related = [...sameCategory, ...fill].slice(0, 4);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28">
      <JsonLd
        data={listingJsonLd({
          ...seo,
          seller: profile?.full_name ?? null,
          created_at: listing.created_at,
        })}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs, origin)} />

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-charcoal/55"
      >
        {crumbs.map((c, i) => (
          <span key={c.name} className="flex items-center gap-2">
            {i > 0 && <span className="text-charcoal/25">/</span>}
            {c.path ? (
              <Link href={c.path} className="transition-colors hover:text-navy hover:underline">
                {c.name}
              </Link>
            ) : (
              <span className="truncate text-charcoal/80">{c.name}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: image + details */}
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone">
            {listing.primary_image_url ? (
              <Image
                src={listing.primary_image_url}
                alt={listingImageAlt(seo)}
                fill
                sizes="(min-width: 1024px) 620px, 100vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-6xl text-charcoal/20">
                📦
              </div>
            )}
          </div>

          <ShareButtons url={url} title={`${heading} — ${price}`} />

          <div className="mt-6 space-y-6">
            {listing.description && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-charcoal/40">
                  Description
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
                  {listing.description}
                </p>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-charcoal/40">
                Item details
              </h2>
              <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
                {specs.map((s) => (
                  <div key={s.label} className="flex gap-4 px-4 py-3 text-sm">
                    <dt className="w-32 shrink-0 text-charcoal/50">{s.label}</dt>
                    <dd className="font-medium text-navy">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <div className="flex flex-wrap gap-4 text-xs text-charcoal/40">
              {place && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {place.label}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="size-3" /> {listing.views} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(listing.created_at).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: price + contact */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            {/* The H1 states the product, the intent and the place — the same
                sentence the title tag uses, so the page matches the SERP. */}
            <h1 className="font-display text-2xl leading-snug text-navy">{heading}</h1>
            <p className="mt-3 font-display text-3xl font-semibold text-navy">{price}</p>
            {place && (
              <p className="mt-1 text-sm text-charcoal/55">
                <MapPin className="mr-1 inline size-3.5" />
                {place.label}
              </p>
            )}

            {isOwner ? (
              <div className="mt-4 rounded-lg bg-stone p-3 text-center text-sm text-charcoal/60">
                This is your listing.{" "}
                <Link href="/account/listings" className="font-medium text-navy hover:underline">
                  Manage it
                </Link>
              </div>
            ) : (
              <ListingContact
                listing={seo}
                url={url}
                phone={isVa ? null : profile?.phone ?? null}
                email={isVa ? sellerEmail : null}
              />
            )}
          </div>

          {/* Seller card */}
          {profile && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-charcoal/40">
                Seller
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                  {profile.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-medium text-navy">{profile.full_name ?? "Anonymous"}</p>
                  {profile.location && (
                    <p className="text-xs text-charcoal/50">
                      <MapPin className="mr-0.5 inline size-3" />
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Safety notice */}
          <div className="rounded-xl border border-border bg-stone p-4 text-xs text-charcoal/60">
            <p className="flex items-center gap-1.5 font-semibold text-navy">
              <ShieldCheck className="size-3.5" /> Stay safe
            </p>
            <ul className="mt-1.5 space-y-1">
              <li>• Meet in a public place for the exchange</li>
              <li>• Inspect the item before paying</li>
              <li>• Never pay in advance without seeing the item</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related listings — real internal links, chosen by category. */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl text-navy">
            {category ? `More ${category.noun.toLowerCase()} for sale` : "More on the Marketplace"}
            {place?.slug ? ` near ${place.city}` : ""}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
          {category && (
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/marketplace/${category.slug}`}
                className="text-navy underline-offset-4 hover:underline"
              >
                All {category.noun.toLowerCase()} for sale in Kenya
              </Link>
              {city && (
                <>
                  <span className="text-charcoal/30">·</span>
                  <Link
                    href={`/marketplace/${category.slug}/${city.slug}`}
                    className="text-navy underline-offset-4 hover:underline"
                  >
                    {category.noun} in {city.label}
                  </Link>
                </>
              )}
              {place?.slug && (
                <>
                  <span className="text-charcoal/30">·</span>
                  <Link
                    href={`/marketplace/${category.slug}/${place.slug}`}
                    className="text-navy underline-offset-4 hover:underline"
                  >
                    {category.noun} in {place.label}
                  </Link>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
