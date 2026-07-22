import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { NewArrivalsSignup } from "@/components/marketing/new-arrivals-signup";
import { Button } from "@/components/ui/button";
import { getRegion } from "@/lib/region.server";
import { regionContent } from "@/lib/site";
import { getMarketplaceListings } from "@/lib/queries";
import { buildOpenGraph, regionAlternates } from "@/lib/seo";

// Region-specific listings + copy — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const region = await getRegion();
  const title = "Marketplace — Estate Edit";
  const description = `Browse items posted by sellers across ${regionContent[region].place}. Furniture, art, jewellery, vehicles, and more.`;
  return {
    title,
    description,
    // Category/search filters are thin slices of the same catalogue — canonicalize to the base listing.
    alternates: regionAlternates("/marketplace", region),
    openGraph: buildOpenGraph({ title, description, path: "/marketplace", region }),
  };
}

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "furniture", label: "Furniture" },
  { value: "fine_art", label: "Fine Art" },
  { value: "jewelry", label: "Jewellery" },
  { value: "vehicles", label: "Vehicles" },
  { value: "collectibles", label: "Collectibles" },
  { value: "designer", label: "Designer" },
  { value: "antiques", label: "Antiques" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const region = await getRegion();
  const listings = await getMarketplaceListings(region, params.category ?? "", params.q ?? "");

  return (
    <main className="min-h-screen bg-stone">
      {/* Header */}
      <div className="relative overflow-hidden bg-navy pb-8 pt-28 text-center text-white sm:pb-10 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute -right-20 -top-16 hidden size-72 rounded-full bg-gold/10 blur-[100px] sm:block" />
        <div className="relative">
          <h1 className="font-display text-4xl sm:text-5xl">Marketplace</h1>
          <p className="mx-auto mt-3 max-w-xl px-5 text-sm text-white/60 sm:text-base">
            Curated items from sellers across {regionContent[region].place}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <form className="flex flex-1 items-center gap-2">
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search listings…"
              className="min-w-0 flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm" className="bg-navy text-white hover:bg-navy-soft">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <Link
                key={value}
                href={value ? `/marketplace?category=${value}` : "/marketplace"}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  params.category === value || (!params.category && value === "")
                    ? "bg-navy text-white"
                    : "border border-border bg-white text-charcoal/70 hover:bg-stone"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Listings grid */}
        {!listings || listings.length === 0 ? (
          <div className="rounded-xl border border-border bg-white py-20 text-center shadow-sm">
            <Store className="mx-auto mb-4 size-12 text-charcoal/20" />
            <p className="font-medium text-navy">No listings yet</p>
            <p className="mt-1 text-sm text-charcoal/50">
              Be the first to post an item for sale.
            </p>
            <Button asChild className="mt-5 bg-navy text-white hover:bg-navy-soft">
              <Link href="/sell/post">Post a listing</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-charcoal/50">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
              {params.category && ` in ${params.category.replace(/_/g, " ")}`}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
      <NewArrivalsSignup source="marketplace" />
    </main>
  );
}
