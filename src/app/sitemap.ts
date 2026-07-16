import type { MetadataRoute } from "next";
import { getAllAssetSlugsWithMarket, getAllListingSlugsWithMarket } from "@/lib/queries";
import { SITE_URL, US_SITE_URL, siteUrlForRegion } from "@/lib/seo";
import { areaSlug } from "@/lib/region";
import { regionContent } from "@/lib/site";
import { isRegion } from "@/lib/region";

// Regenerate periodically so newly published assets appear without a redeploy.
export const revalidate = 3600;

/**
 * hreflang alternates for pages that exist in BOTH markets (same route, region-
 * varying content) — declares the Kenya + Virginia URLs so each is indexed and
 * Google serves the right one. Individual catalogue items/listings belong to a
 * single market, so they are NOT given cross-region alternates.
 */
function languages(path: string) {
  return {
    "en-KE": `${SITE_URL}${path}`,
    "en-US": `${US_SITE_URL}${path}`,
    "x-default": `${SITE_URL}${path}`,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static marketing/legal routes with hand-tuned priorities.
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/collection", priority: 0.9, changeFrequency: "daily" },
    { path: "/estate-sales", priority: 0.8, changeFrequency: "monthly" },
    { path: "/commercial-liquidation", priority: 0.8, changeFrequency: "monthly" },
    { path: "/concierge", priority: 0.8, changeFrequency: "monthly" },
    { path: "/expat-services", priority: 0.8, changeFrequency: "monthly" },
    { path: "/marketplace", priority: 0.8, changeFrequency: "daily" },
    { path: "/delivery", priority: 0.5, changeFrequency: "monthly" },
    { path: "/sell", priority: 0.5, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  // Each of these routes is served on BOTH domains with region-appropriate
  // content (see the matching generateMetadata in every one of these pages),
  // so each needs its OWN sitemap entry — one Kenya, one Virginia — not just
  // a single Kenya entry with a one-way hreflang hint. Without the Virginia
  // entry, the Virginia copy of every marketing/legal page is a real,
  // 200-OK, indexable page that's simply absent from the sitemap.
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((r) =>
    (["kenya", "virginia"] as const).map((region) => ({
      url: `${siteUrlForRegion(region)}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
      alternates: { languages: languages(r.path) },
    })),
  );

  // Dynamic catalogue pages. getAllAssetSlugsWithMarket/getAllListingSlugsWithMarket
  // are resilient (fall back to static/empty content on DB error), so this never
  // throws/breaks the build.
  //
  // Each asset/listing belongs to a single market — its sitemap URL must use
  // THAT market's own domain, not always the Kenya apex. Serving a Virginia
  // (USD) item's canonical under estateedit.org (and vice versa) produces a
  // domain/content mismatch that both Google and Ahrefs flag.
  //
  // NOTE: we deliberately omit the `images` field. Next 16's sitemap serializer
  // does NOT XML-escape `&` inside <image:loc>, and asset photos are Unsplash/
  // Supabase URLs full of query-string ampersands — that produced invalid XML
  // ("EntityRef: expecting ';'") and broke the whole sitemap. Image discovery
  // is already covered by OG tags + Product JSON-LD.
  const assetRows = await getAllAssetSlugsWithMarket();
  // De-duped defensively: a stale/duplicate slug here would otherwise surface
  // as the same URL twice in one sitemap.
  const seenAssets = new Set<string>();
  const assetEntries: MetadataRoute.Sitemap = assetRows
    .filter((a) => (seenAssets.has(a.slug) ? false : (seenAssets.add(a.slug), true)))
    .map(({ slug, market }) => ({
      url: `${siteUrlForRegion(isRegion(market) ? market : "kenya")}/collection/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const listingRows = await getAllListingSlugsWithMarket();
  const seenListings = new Set<string>();
  const listingEntries: MetadataRoute.Sitemap = listingRows
    .filter((l) => (seenListings.has(l.slug) ? false : (seenListings.add(l.slug), true)))
    .map(({ slug, market }) => ({
      url: `${siteUrlForRegion(isRegion(market) ? market : "kenya")}/marketplace/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Area landing pages — each locality belongs to a single market (like
  // catalogue items), so no cross-region hreflang alternates.
  const areaEntries: MetadataRoute.Sitemap = (["kenya", "virginia"] as const).flatMap((region) =>
    regionContent[region].areasServed.map((area) => ({
      url: `${siteUrlForRegion(region)}/areas/${areaSlug(area)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...staticEntries, ...assetEntries, ...listingEntries, ...areaEntries];
}
