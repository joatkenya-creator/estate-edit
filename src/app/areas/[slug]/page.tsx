import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { House, Warehouse, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { FeaturedAssets } from "@/components/sections/featured-assets";
import { CtaBand } from "@/components/sections/cta-band";
import { getRegion } from "@/lib/region.server";
import { areaSlug } from "@/lib/region";
import { regionContent } from "@/lib/site";
import { buildOpenGraph, breadcrumbJsonLd, regionAlternates, siteUrlForRegion } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ListingCard } from "@/components/listings/listing-card";
import { getMarketplaceListings } from "@/lib/queries";
import { MARKETPLACE_CATEGORIES, areaSlugMatches } from "@/lib/marketplace";
import Link from "next/link";

// Region-specific area list, so it must render per request.
export const dynamic = "force-dynamic";

/** Resolve the requested slug to a real "Areas Served" locality for the current region, or null. */
async function resolveArea(slug: string) {
  const region = await getRegion();
  const area = regionContent[region].areasServed.find((a) => areaSlug(a) === slug);
  return area ? { region, area } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveArea(slug);
  if (!resolved) return { title: "Area not found" };

  const { region, area } = resolved;
  const place = region === "virginia" ? "Virginia" : "Nairobi";
  const title = `${area} Estate Sales & Liquidation`;
  const description = `Luxury estate sales, liquidation, and concierge transitions for families and businesses in ${area}, ${place} — discreet valuation, marketing, and sale.`;

  return {
    title,
    description,
    alternates: regionAlternates(`/areas/${slug}`, region),
    openGraph: buildOpenGraph({ title, description, path: `/areas/${slug}`, region }),
  };
}

const CATEGORIES = [
  {
    icon: House,
    title: "Estate Sales",
    description:
      "Full-service management and sale of luxury households, inherited estates, fine art, jewellery, and collector vehicles.",
  },
  {
    icon: Warehouse,
    title: "Commercial Liquidation",
    description:
      "Discreet, value-maximising disposal of business assets for closures, relocations, and fleet or warehouse reductions.",
  },
  {
    icon: Users,
    title: "Concierge Transition",
    description:
      "White-glove support for major life changes: downsizing, relocation, cleanouts, and complete property preparation.",
  },
];

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveArea(slug);
  if (!resolved) notFound();

  const { region, area } = resolved;
  const content = regionContent[region];

  return (
    <main className="flex-1">
      <JsonLd
        data={breadcrumbJsonLd(
          [{ name: "Home", path: "/" }, { name: "Areas Served" }, { name: area }],
          siteUrlForRegion(region),
        )}
      />
      <PageHero
        eyebrow="Areas Served"
        title={`Estate Sales & Liquidation in ${area}`}
        subtitle={`${content.lede} Serving families, executors, and businesses in ${area} and across ${content.serves}.`}
        crumbs={[{ label: "Areas Served" }, { label: area }]}
      />

      <CategoryGrid
        eyebrow="What We Handle"
        heading={`Our services in ${area}`}
        intro={`Every engagement in ${area} is catalogued, valued, and marketed to a private network of qualified buyers.`}
        items={CATEGORIES}
      />

      <FeaturedAssets />
      <AreaMarketplace area={area} slug={slug} />
      <CtaBand
        title={`Ready to begin in ${area}?`}
        subtitle="Begin with a private, no-obligation consultation. Our concierge team responds within one business day."
      />
    </main>
  );
}

/**
 * Marketplace items physically located in this area.
 *
 * An area page that only talks about services is a brochure; one that also
 * shows what is for sale here is a local search result. It also gives every
 * locality a genuine internal link into the marketplace listings and category
 * pages that mention it — the connection Google needs to associate
 * "<area>" with "<category> for sale".
 */
async function AreaMarketplace({ area, slug }: { area: string; slug: string }) {
  const region = await getRegion();
  const listings = (await getMarketplaceListings(region, "", "")).filter((l) =>
    areaSlugMatches(l.location, slug),
  );
  if (listings.length === 0) return null;

  const categories = MARKETPLACE_CATEGORIES.filter((c) =>
    listings.some((l) => l.category === c.value),
  );

  return (
    <section className="bg-stone py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="eyebrow mb-4">Marketplace</p>
        <h2 className="max-w-2xl text-balance font-display text-3xl font-light text-navy sm:text-4xl">
          Items for sale in {area} right now
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Listed by sellers in {area} and priced by them directly. Contact the seller to view or
          arrange collection.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.slice(0, 4).map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/marketplace/${c.slug}/${slug}`}
              className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
            >
              {c.noun} for sale in {area}
            </Link>
          ))}
          <Link
            href="/marketplace"
            className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-navy hover:text-navy"
          >
            All marketplace listings
          </Link>
        </div>
      </div>
    </section>
  );
}
