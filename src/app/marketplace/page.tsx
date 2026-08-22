import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { MarketplaceSearchForm } from "@/components/marketplace/search-form";
import { NewArrivalsSignup } from "@/components/marketing/new-arrivals-signup";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { getRegion } from "@/lib/region.server";
import { regionContent } from "@/lib/site";
import { getMarketplaceListings } from "@/lib/queries";
import { placesIn } from "@/lib/marketplace.server";
import { MARKETPLACE_CATEGORIES, categoryBySlug, categoryByValue } from "@/lib/marketplace";
import {
  breadcrumbJsonLd,
  buildOpenGraph,
  itemListJsonLd,
  regionAlternates,
  siteUrlForRegion,
} from "@/lib/seo";

// Region-specific listings + copy — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const region = await getRegion();
  const place = regionContent[region].place;
  const title = `Marketplace | Furniture & Curated Items for Sale in ${place} | Estate Edit`;
  const description = `Browse furniture, fine art, jewellery, vehicles and collectables listed for sale by owners across ${place}. Prices in ${
    region === "virginia" ? "USD" : "KES"
  } — contact the seller directly on The Estate Edit Marketplace.`;

  return {
    title: { absolute: title },
    description,
    // The `?category=` and `?q=` variants are the same catalogue sliced, not
    // separate pages: they all canonicalise to /marketplace, and the crawlable
    // versions live at /marketplace/<category>[/<area>]. Filtered views are
    // also noindexed so they can't compete with those real pages.
    alternates: regionAlternates("/marketplace", region),
    robots: params.category || params.q ? { index: false, follow: true } : undefined,
    openGraph: buildOpenGraph({ title, description, path: "/marketplace", region }),
  };
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const region = await getRegion();
  const origin = siteUrlForRegion(region);
  const place = regionContent[region].place;

  // Legacy `?category=furniture` links (emails, old shares) still work; the
  // navigation now points at the crawlable /marketplace/<category> paths.
  const listings = await getMarketplaceListings(region, params.category ?? "", params.q ?? "");
  const activeCategory = categoryByValue(params.category) ?? categoryBySlug(params.category ?? "");

  // Only show a category chip if something is actually in it — an empty chip
  // sends a buyer (and a crawler) to a dead page.
  const stocked = new Set(listings.map((l) => l.category));
  const allListings = params.category || params.q
    ? await getMarketplaceListings(region, "", "")
    : listings;
  const stockedAll = new Set(allListings.map((l) => l.category));
  const topPlaces = placesIn(allListings).slice(0, 8);

  return (
    <main className="min-h-screen bg-stone">
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Marketplace" }], origin)}
      />
      {listings.length > 0 && (
        <JsonLd
          data={itemListJsonLd(
            `Items for sale in ${place}`,
            listings.map((l) => `/marketplace/${l.slug}`),
            origin,
          )}
        />
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-navy pb-10 pt-28 text-center text-white sm:pb-12 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute -right-20 -top-16 hidden size-72 rounded-full bg-gold/10 blur-[100px] sm:block" />
        <div className="relative mx-auto max-w-3xl px-5">
          <p className="eyebrow mb-4 text-gold-soft">The Estate Edit Marketplace</p>
          <h1 className="font-display text-3xl sm:text-5xl">
            Furniture &amp; Curated Items for Sale in {place}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
            Pieces listed directly by their owners — furniture, art, jewellery, vehicles and
            collectables. Every price is set by the seller, and you deal with them directly.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        {/* Search + category navigation */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <MarketplaceSearchForm defaultValue={params.q} />

          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            <Link
              href="/marketplace"
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !activeCategory
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-charcoal/70 hover:bg-stone"
              }`}
            >
              All categories
            </Link>
            {MARKETPLACE_CATEGORIES.filter((c) => c.primary || stockedAll.has(c.value)).map((c) => (
              <Link
                key={c.slug}
                href={`/marketplace/${c.slug}`}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory?.slug === c.slug
                    ? "bg-navy text-white"
                    : "border border-border bg-white text-charcoal/70 hover:bg-stone"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Listings grid */}
        {listings.length === 0 ? (
          <div className="rounded-xl border border-border bg-white py-20 text-center shadow-sm">
            <Store className="mx-auto mb-4 size-12 text-charcoal/20" />
            <p className="font-medium text-navy">No listings match that search</p>
            <p className="mt-1 text-sm text-charcoal/50">
              Try a different term, or browse everything currently available.
            </p>
            <Button asChild className="mt-5 bg-navy text-white hover:bg-navy-soft">
              <Link href="/marketplace">Browse all listings</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-charcoal/55">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
              {activeCategory ? ` in ${activeCategory.label}` : ""}
              {params.q ? ` matching “${params.q}”` : ""}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing, i) => (
                <ListingCard key={listing.slug} listing={listing} priority={i < 4} />
              ))}
            </div>
          </>
        )}

        {/* Crawlable browse paths — these are the pages that can rank for
            "<category> for sale in <place>", so they are real links, not
            JavaScript filters. */}
        <section className="mt-14">
          <h2 className="font-display text-lg text-navy">Browse by category</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {MARKETPLACE_CATEGORIES.filter((c) => c.primary || stocked.has(c.value)).map((c) => (
              <Link
                key={c.slug}
                href={`/marketplace/${c.slug}`}
                className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
              >
                {c.noun} for sale in {place}
              </Link>
            ))}
          </div>
        </section>

        {topPlaces.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg text-navy">Browse by location</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {topPlaces.map(({ place: p, count, topCategory }) =>
                topCategory ? (
                  <Link
                    key={p.slug}
                    href={`/marketplace/${topCategory.slug}/${p.slug}`}
                    className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
                  >
                    {topCategory.noun} for sale in {p.label}
                    <span className="ml-1.5 text-charcoal/35">{count}</span>
                  </Link>
                ) : null,
              )}
            </div>
          </section>
        )}

        {/* Marketplace ↔ services: the estate business feeds the marketplace. */}
        <section className="mt-12 rounded-xl border border-border bg-white p-6 text-sm leading-relaxed text-charcoal/70 shadow-sm">
          <h2 className="font-display text-lg text-navy">Selling something?</h2>
          <p className="mt-2 max-w-2xl">
            List an item yourself on the Marketplace, browse{" "}
            <Link href="/collection" className="text-navy underline-offset-4 hover:underline">
              The Collection
            </Link>{" "}
            of pieces we have catalogued and valued ourselves, or talk to us about a full{" "}
            <Link href="/estate-sales" className="text-navy underline-offset-4 hover:underline">
              estate sale
            </Link>{" "}
            or{" "}
            <Link
              href="/commercial-liquidation"
              className="text-navy underline-offset-4 hover:underline"
            >
              commercial liquidation
            </Link>
            .
          </p>
          <Button asChild className="mt-5 bg-navy text-white hover:bg-navy-soft">
            <Link href="/sell">Post a listing</Link>
          </Button>
        </section>
      </div>

      <NewArrivalsSignup source="marketplace" />
    </main>
  );
}
