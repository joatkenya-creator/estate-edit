import type { MetadataRoute } from "next";
import { getCatalogueAssets } from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";

// Regenerate periodically so newly published assets appear without a redeploy.
export const revalidate = 3600;

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
  }));

  // Dynamic catalogue pages. getCatalogueAssets is resilient (falls back to
  // static content on DB error), so this never throws/breaks the build.
  const assets = await getCatalogueAssets();
  const assetEntries: MetadataRoute.Sitemap = assets
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${SITE_URL}/collection/${a.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      ...(a.imageUrl ? { images: [a.imageUrl] } : {}),
    }));

  return [...staticEntries, ...assetEntries];
}
