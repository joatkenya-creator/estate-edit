import type { MetadataRoute } from "next";
import { getAllAssetSlugsWithMarket, getListingSeoIndex } from "@/lib/queries";
import { SITE_URL, US_SITE_URL, siteUrlForRegion } from "@/lib/seo";
import { areaSlug } from "@/lib/region";
import { regionContent } from "@/lib/site";
import { isRegion } from "@/lib/region";
import { categoryByValue, cityOf, resolvePlace } from "@/lib/marketplace";

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
    { path: "/marketplace", priority: 0.9, changeFrequency: "daily" },
    { path: "/collection", priority: 0.9, changeFrequency: "daily" },
    { path: "/estate-sales", priority: 0.8, changeFrequency: "monthly" },
    { path: "/commercial-liquidation", priority: 0.8, changeFrequency: "monthly" },
    { path: "/concierge", priority: 0.8, changeFrequency: "monthly" },
    { path: "/expat-services", priority: 0.8, changeFrequency: "monthly" },
    { path: "/delivery", priority: 0.5, changeFrequency: "monthly" },
    { path: "/sell", priority: 0.6, changeFrequency: "monthly" },
    { path: "/sell-with-us", priority: 0.5, changeFrequency: "monthly" },
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

  // Dynamic catalogue pages. getAllAssetSlugsWithMarket/getListingSeoIndex
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

  // Marketplace listings. `lastModified` is each row's real `updated_at` — a
  // sitemap where every URL claims to have changed at crawl time is a signal
  // Google learns to ignore. Priority 0.8: these are the pages the whole
  // marketplace strategy exists to get indexed.
  const listingRows = await getListingSeoIndex();
  const seenListings = new Set<string>();
  const listingEntries: MetadataRoute.Sitemap = listingRows
    .filter((l) => (seenListings.has(l.slug) ? false : (seenListings.add(l.slug), true)))
    .map((l) => ({
      url: `${siteUrlForRegion(l.currency === "USD" ? "virginia" : "kenya")}/marketplace/${l.slug}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  // Category and category+location browse pages — but ONLY the combinations a
  // real listing resolves to. Generating a page per category x per known
  // Kenyan locality would mint hundreds of empty URLs; deriving them from the
  // listings themselves means every submitted URL has something on it, and new
  // combinations appear automatically as sellers post.
  //
  // A listing counts towards its neighbourhood AND its city, because the pages
  // work that way: a Ngong Road listing appears on /furniture/ngong-road and on
  // /furniture/nairobi. A neighbourhood URL is then only submitted when it
  // holds FEWER listings than its city — if the two show an identical set they
  // are the same page twice, and the broader one is the one worth ranking. As
  // soon as a second Nairobi neighbourhood posts furniture, the Ngong Road page
  // becomes distinct and is submitted automatically.
  type Bucket = { url: string; lastModified: Date; count: number; cityKey: string | null };
  const categorySeen = new Map<string, Date>();
  const buckets = new Map<string, Bucket>();

  const bump = (key: string, url: string, updated: Date, cityKey: string | null) => {
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      if (existing.lastModified < updated) existing.lastModified = updated;
    } else {
      buckets.set(key, { url, lastModified: updated, count: 1, cityKey });
    }
  };

  for (const row of listingRows) {
    const category = categoryByValue(row.category);
    if (!category) continue;
    const origin = siteUrlForRegion(row.currency === "USD" ? "virginia" : "kenya");
    const updated = new Date(row.updated_at);
    const catUrl = `${origin}/marketplace/${category.slug}`;
    if ((categorySeen.get(catUrl)?.getTime() ?? 0) < updated.getTime()) {
      categorySeen.set(catUrl, updated);
    }

    const place = resolvePlace(row.location);
    if (!place?.slug) continue;
    const city = cityOf(place);
    const cityKey = city ? `${catUrl}/${city.slug}` : null;
    bump(`${catUrl}/${place.slug}`, `${catUrl}/${place.slug}`, updated, cityKey);
    if (city && cityKey) bump(cityKey, cityKey, updated, null);
  }

  const categoryEntries: MetadataRoute.Sitemap = [...categorySeen].map(([url, lastModified]) => ({
    url,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const placeEntries: MetadataRoute.Sitemap = [...buckets.values()]
    .filter((b) => {
      if (!b.cityKey) return true; // a city page: always worth submitting
      const city = buckets.get(b.cityKey);
      return !city || b.count < city.count; // else it duplicates its city page
    })
    .map((b) => ({
      url: b.url,
      lastModified: b.lastModified,
      changeFrequency: "daily" as const,
      // City pages carry the query volume ("furniture for sale in Nairobi");
      // neighbourhood pages are the long tail beneath them.
      priority: b.cityKey ? 0.7 : 0.8,
    }));

  // Editorial guides. Kenya-only content (Nairobi buying advice), so no
  // Virginia entry and no hreflang pair — there is no US counterpart to serve.
  const guideEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/guides/buying-wooden-furniture-in-nairobi`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

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

  return [
    ...staticEntries,
    ...assetEntries,
    ...listingEntries,
    ...categoryEntries,
    ...placeEntries,
    ...guideEntries,
    ...areaEntries,
  ];
}
