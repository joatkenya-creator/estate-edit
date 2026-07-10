import type { MetadataRoute } from "next";
import { getAllAssetSlugs, getAllListingSlugs } from "@/lib/queries";
import { SITE_URL, US_SITE_URL } from "@/lib/seo";

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

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    alternates: { languages: languages(r.path) },
  }));

  // Dynamic catalogue pages. getCatalogueAssets is resilient (falls back to
  // static content on DB error), so this never throws/breaks the build.
  //
  // NOTE: we deliberately omit the `images` field. Next 16's sitemap serializer
  // does NOT XML-escape `&` inside <image:loc>, and asset photos are Unsplash/
  // Supabase URLs full of query-string ampersands — that produced invalid XML
  // ("EntityRef: expecting ';'") and broke the whole sitemap. Image discovery
  // is already covered by OG tags + Product JSON-LD.
  const slugs = await getAllAssetSlugs();
  // De-duped defensively: a stale/duplicate slug here would otherwise surface
  // as the same URL twice in one sitemap.
  const assetEntries: MetadataRoute.Sitemap = [...new Set(slugs)].map((slug) => ({
    url: `${SITE_URL}/collection/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const listingSlugs = await getAllListingSlugs();
  const listingEntries: MetadataRoute.Sitemap = [...new Set(listingSlugs)].map((slug) => ({
    url: `${SITE_URL}/marketplace/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...assetEntries, ...listingEntries];
}
