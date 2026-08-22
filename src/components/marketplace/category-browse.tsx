import Link from "next/link";
import { Store } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { NewArrivalsSignup } from "@/components/marketing/new-arrivals-signup";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { breadcrumbJsonLd, itemListJsonLd, siteUrlForRegion } from "@/lib/seo";
import {
  MARKETPLACE_CATEGORIES,
  categoryHeading,
  type MarketplaceCategory,
  type Place,
} from "@/lib/marketplace";
import { placesIn } from "@/lib/marketplace.server";
import { type MarketplaceListing } from "@/lib/queries";
import { type Region } from "@/lib/region";

/**
 * Shared body for /marketplace/<category> and /marketplace/<category>/<area>.
 *
 * These pages exist because a query-string filter (`?category=furniture`) is
 * not a page Google will rank — it is one URL wearing many hats. A real path
 * gives each category and each locality its own title, description, H1,
 * breadcrumb and canonical, so "furniture for sale in Nairobi" has something
 * on the site that is actually about that.
 *
 * Every listing is a plain <a href> inside server-rendered HTML, and the
 * ItemList block repeats those URLs for crawlers, so nothing about discovery
 * depends on client-side JavaScript.
 */
export function CategoryBrowse({
  category,
  place,
  city = null,
  listings,
  region,
}: {
  category: MarketplaceCategory;
  place: Place | null;
  /** The city `place` sits inside, when `place` is a neighbourhood. */
  city?: Place | null;
  listings: MarketplaceListing[];
  region: Region;
}) {
  const origin = siteUrlForRegion(region);
  const basePath = `/marketplace/${category.slug}`;
  const path = place ? `${basePath}/${place.slug}` : basePath;
  const heading = categoryHeading(category, place);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    place ? { name: category.label, path: basePath } : { name: category.label },
    // Home > Marketplace > Furniture > Nairobi > Ngong Road — the city is a
    // real page, so it belongs in the trail rather than being skipped over.
    ...(city ? [{ name: city.label, path: `${basePath}/${city.slug}` }] : []),
    ...(place ? [{ name: place.label }] : []),
  ];

  // Localities to cross-link. On a category page these are the places that
  // hold stock; on a locality page, the OTHER places in the same category.
  const otherPlaces = placesIn(listings).filter((p) => p.place.slug !== place?.slug);
  const siblingCategories = MARKETPLACE_CATEGORIES.filter(
    (c) => c.primary && c.slug !== category.slug,
  );

  return (
    <main className="min-h-screen bg-stone">
      <JsonLd data={breadcrumbJsonLd(crumbs, origin)} />
      {listings.length > 0 && (
        <JsonLd
          data={itemListJsonLd(
            heading,
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
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs text-white/55"
          >
            {crumbs.map((c, i) => (
              <span key={c.name} className="flex items-center gap-2">
                {i > 0 && <span className="text-white/25">/</span>}
                {c.path ? (
                  <Link href={c.path} className="transition-colors hover:text-gold">
                    {c.name}
                  </Link>
                ) : (
                  <span className="text-white/80">{c.name}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="font-display text-3xl sm:text-5xl">{heading}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
            {category.intro}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6">
        {listings.length === 0 ? (
          <div className="rounded-xl border border-border bg-white py-20 text-center shadow-sm">
            <Store className="mx-auto mb-4 size-12 text-charcoal/20" />
            <p className="font-medium text-navy">
              No {category.noun.toLowerCase()} listed
              {place ? ` in ${place.label}` : ""} right now
            </p>
            <p className="mt-1 text-sm text-charcoal/50">
              New items are posted regularly — browse everything currently available.
            </p>
            <Button asChild className="mt-5 bg-navy text-white hover:bg-navy-soft">
              <Link href="/marketplace">Browse the Marketplace</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-charcoal/55">
              {listings.length} {category.noun.toLowerCase()} listing
              {listings.length === 1 ? "" : "s"}
              {place ? ` in ${place.label}` : " across Kenya"} — prices shown are set by the seller.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing, i) => (
                <ListingCard key={listing.slug} listing={listing} priority={i < 4} />
              ))}
            </div>
          </>
        )}

        {/* Internal linking: localities in this category, then sibling categories. */}
        {otherPlaces.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-lg text-navy">
              {category.noun} by location
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {otherPlaces.map(({ place: p, count }) => (
                <Link
                  key={p.slug}
                  href={`${basePath}/${p.slug}`}
                  className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
                >
                  {category.noun} in {p.label}
                  <span className="ml-1.5 text-charcoal/35">{count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-display text-lg text-navy">Other categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {city && (
              <Link
                href={`${basePath}/${city.slug}`}
                className="rounded-full border border-navy bg-white px-3.5 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-navy hover:text-white"
              >
                All {category.noun.toLowerCase()} in {city.label}
              </Link>
            )}
            {place && (
              <Link
                href={basePath}
                className="rounded-full border border-navy bg-white px-3.5 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-navy hover:text-white"
              >
                All {category.noun.toLowerCase()} in Kenya
              </Link>
            )}
            {siblingCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/marketplace/${c.slug}`}
                className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
              >
                {c.noun} for sale
              </Link>
            ))}
          </div>
        </section>
      </div>

      <NewArrivalsSignup source={`marketplace-${path.replace(/\//g, "-")}`} />
    </main>
  );
}
