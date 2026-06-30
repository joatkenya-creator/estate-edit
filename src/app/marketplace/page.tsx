import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { getRegion } from "@/lib/region.server";
import { regionContent } from "@/lib/site";
import { regionCurrency } from "@/lib/region";

// Region-specific listings + copy — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const region = await getRegion();
  return {
    title: "Marketplace — Estate Edit",
    description: `Browse items posted by sellers across ${regionContent[region].place}. Furniture, art, jewellery, vehicles, and more.`,
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
  const supabase = await createClient();

  let query = supabase
    .from("user_listings")
    .select(`
      slug, title, description, price, currency, category, condition, location,
      primary_image_url, views,
      user_profiles ( full_name )
    `)
    .eq("status", "active")
    .eq("currency", regionCurrency[region])
    .order("created_at", { ascending: false })
    .limit(60);

  if (params.category) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = query.eq("category", params.category as any);
  }
  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const { data: listings } = await query;

  return (
    <main className="min-h-screen bg-stone">
      {/* Header */}
      <div className="bg-navy py-14 text-center text-white">
        <h1 className="font-display text-4xl">Marketplace</h1>
        <p className="mt-2 text-white/60">
          Curated items from sellers across {regionContent[region].place}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
              {listings.map((listing) => {
                const profile = Array.isArray(listing.user_profiles)
                  ? listing.user_profiles[0]
                  : listing.user_profiles;
                return (
                  <ListingCard
                    key={listing.slug}
                    listing={{
                      ...listing,
                      user_profiles: profile as { full_name?: string | null } | null,
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
