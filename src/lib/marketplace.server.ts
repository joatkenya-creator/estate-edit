import "server-only";
import { getMarketplaceListings, type MarketplaceListing } from "@/lib/queries";
import {
  categoryByValue,
  cityOf,
  isCityPlace,
  placeMatches,
  resolvePlace,
  type MarketplaceCategory,
  type Place,
} from "@/lib/marketplace";
import { type Region } from "@/lib/region";

/**
 * Listings for a category landing page, optionally narrowed to one locality.
 *
 * The category read goes through the existing cached marketplace query, and
 * the locality narrowing happens in memory: a seller's `location` is free text
 * ("Ngong road opposite Raila odinga stadium"), so it can only be matched by
 * the same recogniser that renders it. Filtering ≤200 cached rows is cheaper
 * than a second round trip and avoids a schema change.
 *
 * `placeMatches` (not an exact slug comparison) is what makes a CITY page work:
 * sellers type a street or an estate, never "Nairobi", so matching exactly
 * would leave /marketplace/furniture/nairobi permanently empty while
 * /marketplace/furniture/ngong-road had everything.
 *
 * Shared by /marketplace/[category] and /marketplace/[category]/[area] and by
 * both of their generateMetadata functions — all four hit the same cache entry.
 */
export async function getCategoryListings(
  region: Region,
  category: MarketplaceCategory,
  place?: Place | null,
): Promise<MarketplaceListing[]> {
  const listings = await getMarketplaceListings(region, category.value, "");
  if (!place) return listings;
  return listings.filter((l) => placeMatches(l.location, place));
}

/**
 * The localities that have listings in this set, most-stocked first, each
 * paired with the category it holds most of — so a "browse by location" link
 * always points at a /marketplace/<category>/<area> page with something on it.
 *
 * A listing counts towards BOTH its neighbourhood and the city that
 * neighbourhood sits in, mirroring what the pages themselves show. Cities are
 * listed before equally-stocked neighbourhoods: "furniture for sale in
 * Nairobi" is the query with the volume behind it.
 */
export function placesIn(
  listings: MarketplaceListing[],
): { place: Place; count: number; topCategory: MarketplaceCategory | null }[] {
  const bySlug = new Map<string, { place: Place; count: number; categories: Map<string, number> }>();

  const add = (place: Place, category: string) => {
    const entry = bySlug.get(place.slug) ?? { place, count: 0, categories: new Map() };
    entry.count += 1;
    entry.categories.set(category, (entry.categories.get(category) ?? 0) + 1);
    bySlug.set(place.slug, entry);
  };

  for (const l of listings) {
    const place = resolvePlace(l.location);
    if (!place?.slug) continue;
    add(place, l.category);
    const city = cityOf(place);
    if (city) add(city, l.category);
  }

  return [...bySlug.values()]
    .sort(
      (a, b) =>
        b.count - a.count ||
        Number(isCityPlace(b.place)) - Number(isCityPlace(a.place)) ||
        a.place.label.localeCompare(b.place.label),
    )
    .map(({ place, count, categories }) => {
      const top = [...categories].sort((a, b) => b[1] - a[1])[0]?.[0];
      return { place, count, topCategory: categoryByValue(top) };
    });
}
