import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryBrowse } from "@/components/marketplace/category-browse";
import { getCategoryListings } from "@/lib/marketplace.server";
import { getRegion } from "@/lib/region.server";
import { buildOpenGraph, clampDescription, siteUrlForRegion } from "@/lib/seo";
import {
  categoryBySlug,
  categoryMetaDescription,
  categoryMetaTitle,
  cityOf,
  placeBySlug,
} from "@/lib/marketplace";

export const revalidate = 60;

/**
 * Category + locality landing page: /marketplace/furniture/ngong-road.
 *
 * The segment is named `[slug]` to match its parent (Next requires one name
 * per level) — here it is always a category, and anything else 404s.
 *
 * These are the pages that answer "furniture for sale in Ngong Road" as a
 * page rather than as a filter. They only ever render for a place the
 * recogniser in lib/marketplace actually knows, and a combination with no
 * listings is noindexed rather than published as thin content — which is why
 * this can't degenerate into thousands of empty filter URLs.
 */
type Params = Promise<{ slug: string; area: string }>;

async function resolve(params: Params) {
  const { slug, area } = await params;
  const category = categoryBySlug(slug);
  const place = placeBySlug(area);
  if (!category || !place) return null;
  const region = await getRegion();
  const listings = await getCategoryListings(region, category, place);

  // A neighbourhood page that shows exactly the same items as its city page is
  // the same page twice. Rather than compete with itself, it points its
  // canonical at the city — the broader page, and the one with the search
  // volume behind it. The moment a second neighbourhood in that city posts in
  // this category the sets diverge and the canonical becomes self-referencing
  // again, with no intervention.
  const city = cityOf(place);
  const cityListings = city ? await getCategoryListings(region, category, city) : null;
  const duplicatesCity =
    Boolean(city) && listings.length > 0 && cityListings?.length === listings.length;

  return { category, place, region, listings, city, duplicatesCity };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return { title: "Page not found", robots: { index: false, follow: true } };

  const { category, place, region, listings, city, duplicatesCity } = resolved;
  const title = categoryMetaTitle(category, place);
  const description = clampDescription(
    categoryMetaDescription(category, place, listings.length),
    160,
  );
  const path = `/marketplace/${category.slug}/${place.slug}`;
  const canonicalPath =
    duplicatesCity && city ? `/marketplace/${category.slug}/${city.slug}` : path;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${siteUrlForRegion(region)}${canonicalPath}` },
    // Empty means nothing to index yet. A duplicate of its city is handled by
    // the canonical above, NOT by noindex — mixing noindex with a cross-page
    // canonical sends Google two contradictory instructions.
    robots: listings.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: buildOpenGraph({ title, description, path, region }),
  };
}

export default async function CategoryAreaPage({ params }: { params: Params }) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { category, place, region, listings, city } = resolved;
  return (
    <CategoryBrowse
      category={category}
      place={place}
      city={city}
      listings={listings}
      region={region}
    />
  );
}
