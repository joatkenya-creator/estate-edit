import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { getRegion } from "@/lib/region.server";
import { type Region, regionCurrency } from "@/lib/region";
import {
  services as staticServices,
  statMetrics as staticMetrics,
  testimonials as staticTestimonials,
  featuredAssets as staticAssets,
  assetCategoryLabel,
  defaultDeliverySettings,
  kenyaCounties,
  regionContent,
  type Service,
  type Metric,
  type Testimonial,
  type FeaturedAsset,
  type CatalogueItem,
  type AssetDetail,
  type AssetImage,
  type DeliverySettings,
} from "@/lib/site";

/**
 * Data-access layer for the public site. Each function reads published content
 * from Supabase and falls back to the curated static content in `site.ts` if
 * the table is empty or the request fails, so the page always renders.
 */

// Data-fetching is wrapped in `unstable_cache` throughout this file so pages
// that must render per-request (region detection reads `headers()`, forcing
// `dynamic = "force-dynamic"`) don't also pay for a fresh Supabase round trip
// on every single hit — that combination was producing 1.4s+ TTFB site-wide.
// Request-time values (region) are resolved OUTSIDE the cached function and
// passed in as arguments, per Next's `unstable_cache` constraints.

const getCachedServices = unstable_cache(
  async (): Promise<Service[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("services")
        .select("slug, division, title, summary, icon, offerings")
        .eq("_status", "published")
        .order("sort_order");

      if (error || !data?.length) return staticServices;

      return data.map((s) => ({
        slug: s.slug ?? "",
        division: (s.division ?? "estate_sales") as Service["division"],
        icon: (s.icon ?? "estate") as Service["icon"],
        title: s.title ?? "",
        summary: s.summary ?? "",
        offerings: (s.offerings as string[] | null) ?? [],
      }));
    } catch {
      return staticServices;
    }
  },
  ["services"],
  { revalidate: 600 },
);

export async function getServices(): Promise<Service[]> {
  return getCachedServices();
}

const getCachedKenyaStats = unstable_cache(
  async (): Promise<Metric[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("site_stats")
        .select("label, value, prefix, suffix")
        .eq("_status", "published")
        .order("sort_order");

      if (error || !data?.length) return staticMetrics;

      return data.map((s) => {
        const value = Number(s.value);
        return {
          to: value,
          prefix: s.prefix ?? undefined,
          suffix: s.suffix ?? undefined,
          decimals: Number.isInteger(value) ? 0 : 1,
          label: s.label ?? "",
        };
      });
    } catch {
      return staticMetrics;
    }
  },
  ["kenya-site-stats"],
  { revalidate: 300 },
);

export async function getStats(): Promise<Metric[]> {
  // Virginia: fixed localised stats (no KES client-value figure). Kenya: CMS.
  if ((await getRegion()) === "virginia") return regionContent.virginia.stats;
  return getCachedKenyaStats();
}

/**
 * All current testimonials (DB and static fallback) are Kenya clients — the
 * `testimonials` table has no region column to filter by. Rather than show
 * Nairobi social proof to Virginia visitors, withhold the section there until
 * real Virginia quotes exist.
 */
const getCachedTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("quote, author_name, author_role, location")
        .eq("_status", "published")
        .order("sort_order");

      if (error || !data?.length) return staticTestimonials;

      return data.map((t) => ({
        quote: t.quote ?? "",
        author: t.author_name ?? "",
        role: t.author_role ?? "",
        location: t.location ?? "",
      }));
    } catch {
      return staticTestimonials;
    }
  },
  ["testimonials"],
  { revalidate: 600 },
);

export async function getTestimonials(): Promise<Testimonial[]> {
  if ((await getRegion()) === "virginia") return [];
  return getCachedTestimonials();
}

const tones: FeaturedAsset["tone"][] = ["navy", "charcoal", "crimson", "gold"];

/**
 * Display label for an asset's category. When the category is "other" and the
 * editor typed a custom value (category_other), that custom value is shown
 * instead of the generic "Other".
 */
function categoryDisplay(
  category: string | null | undefined,
  categoryOther: string | null | undefined,
): string {
  if (category === "other" && categoryOther?.trim()) return categoryOther.trim();
  return category ? assetCategoryLabel[category] ?? category : "Other";
}

/**
 * All published asset slugs across BOTH markets, for static pre-rendering and
 * the sitemap. Region-agnostic (no cookies/headers) so it is safe to call at
 * build time inside generateStaticParams / sitemap.
 */
export async function getAllAssetSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("assets")
      .select("slug")
      .eq("_status", "published");
    if (error || !data?.length) return staticAssets.map((a) => a.slug);
    return data.map((a) => a.slug).filter((s): s is string => Boolean(s));
  } catch {
    return staticAssets.map((a) => a.slug);
  }
}

/**
 * Published asset slugs WITH their market, for the sitemap — each asset
 * belongs to a single region, so its sitemap URL must use that region's own
 * domain (not always the Kenya apex). See [[collection/[slug]/page.tsx]] for
 * the matching canonical/hreflang fix.
 */
export async function getAllAssetSlugsWithMarket(): Promise<{ slug: string; market: string }[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("assets")
      .select("slug, market")
      .eq("_status", "published");
    if (error || !data?.length) {
      return staticAssets.map((a) => ({ slug: a.slug, market: "kenya" }));
    }
    return data
      .filter((a): a is { slug: string; market: string | null } => Boolean(a.slug))
      .map((a) => ({ slug: a.slug, market: a.market ?? "kenya" }));
  } catch {
    return staticAssets.map((a) => ({ slug: a.slug, market: "kenya" }));
  }
}

export type ListingSeoRow = {
  slug: string;
  category: string;
  location: string | null;
  currency: string;
  updated_at: string;
};

/**
 * Everything the sitemap needs about every active listing in one read: the
 * slug, the market its currency puts it in, its real `updated_at` (a truthful
 * <lastmod>, not "now" for every URL), and the category + location that decide
 * which browse pages are worth submitting. Region-agnostic and cached, so the
 * sitemap route and the marketplace index can both call it cheaply.
 *
 * Replaced the older slug-only helpers — the sitemap was the only caller and
 * it now needs all of these fields.
 */
export const getListingSeoIndex = unstable_cache(
  async (): Promise<ListingSeoRow[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("user_listings")
        .select("slug, category, location, currency, updated_at")
        .eq("status", "active");
      if (error || !data?.length) return [];
      return data
        .filter((l) => Boolean(l.slug))
        .map((l) => ({
          slug: l.slug as string,
          category: l.category ?? "other",
          location: l.location ?? null,
          currency: l.currency ?? "KES",
          updated_at: l.updated_at ?? new Date().toISOString(),
        }));
    } catch {
      return [];
    }
  },
  ["listing-seo-index"],
  { revalidate: 300, tags: ["listings"] },
);

const getCachedCatalogueAssets = unstable_cache(
  async (region: Region): Promise<CatalogueItem[]> => {
    // Static fallback content is Kenya-only; the Virginia store shows an empty
    // catalogue rather than Kenyan placeholders when there's nothing to show.
    const fallback = (): CatalogueItem[] =>
      region !== "kenya"
        ? []
        : staticAssets.map((a, i) => ({
            ...a,
            categoryKey: "other",
            division: i % 3 === 2 ? "commercial_liquidation" : "estate_sales",
          }));
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("assets")
        .select("slug, title, category, category_other, division, status, price, price_max, currency, price_on_request, delivery_tier, fragile, primary_image_url, metadata, sort_order")
        .eq("_status", "published")
        .eq("market", region)
        .order("sort_order");

      if (error || !data?.length) {
        return fallback();
      }

      return data.map((a, i) => {
        const meta = (a.metadata ?? {}) as { meta?: string; tone?: FeaturedAsset["tone"] };
        const status =
          a.status === "reserved" || a.status === "sold" ? a.status : "available";
        return {
          slug: a.slug ?? "",
          title: a.title ?? "",
          category: categoryDisplay(a.category, a.category_other),
          categoryKey: a.category ?? "other",
          division: a.division ?? "estate_sales",
          meta: meta.meta ?? "",
          status,
          tone: meta.tone ?? tones[i % tones.length],
          imageUrl: a.primary_image_url ?? undefined,
          price: a.price ?? undefined,
          priceMax: a.price_max ?? undefined,
          currency: a.currency ?? "KES",
          priceOnRequest: a.price_on_request ?? false,
          deliveryTier: a.delivery_tier ?? undefined,
          fragile: a.fragile ?? false,
        };
      });
    } catch {
      return fallback();
    }
  },
  ["catalogue-assets"],
  { revalidate: 180 },
);

export async function getCatalogueAssets(): Promise<CatalogueItem[]> {
  const region = await getRegion();
  return getCachedCatalogueAssets(region);
}

const getCachedAssetBySlug = unstable_cache(
  async (slug: string): Promise<AssetDetail | null> => {
    // Build a graceful detail record from the curated static content when the
    // database is empty or unreachable, so links never 404 in local/dev.
    const fallback = (): AssetDetail | null => {
      const a = staticAssets.find((x) => x.slug === slug);
      if (!a) return null;
      return {
        ...a,
        categoryKey: "other",
        division: "estate_sales",
        currency: "KES",
        priceOnRequest: true,
        tags: [],
        images: [],
      };
    };

    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("assets")
        .select(
          "id, slug, title, description, division, category, category_other, status, condition, price, price_max, currency, price_on_request, brand, era, provenance, dimensions, location, primary_image_url, gallery, tags, metadata, delivery_tier, fragile",
        )
        .eq("slug", slug)
        .eq("_status", "published")
        .maybeSingle();

      if (error || !data) return fallback();

      const meta = (data.metadata ?? {}) as { meta?: string; tone?: FeaturedAsset["tone"] };
      const status =
        data.status === "reserved" || data.status === "sold" ? data.status : "available";

      // Gallery is denormalized onto the asset row by Payload (jsonb: [{url, alt}]),
      // so there's no separate image table to query.
      const galleryRows = (data.gallery ?? []) as { url: string; alt?: string }[];
      const images: AssetImage[] = galleryRows
        .filter((im) => im?.url)
        .map((im) => ({
          url: im.url,
          alt: im.alt ?? data.title ?? "",
        }));

      return {
        slug: data.slug ?? "",
        title: data.title ?? "",
        category: categoryDisplay(data.category, data.category_other),
        categoryKey: data.category ?? "other",
        division: data.division ?? "estate_sales",
        status,
        tone: meta.tone ?? "navy",
        meta: meta.meta ?? "",
        imageUrl: data.primary_image_url ?? undefined,
        description: data.description ?? undefined,
        condition: data.condition ?? undefined,
        brand: data.brand ?? undefined,
        era: data.era ?? undefined,
        provenance: data.provenance ?? undefined,
        dimensions: data.dimensions ?? undefined,
        location: data.location ?? undefined,
        price: data.price ?? undefined,
        priceMax: data.price_max ?? undefined,
        currency: data.currency ?? "KES",
        priceOnRequest: data.price_on_request ?? false,
        tags: (data.tags as string[] | null) ?? [],
        images,
        deliveryTier: data.delivery_tier ?? undefined,
        fragile: data.fragile ?? false,
      };
    } catch {
      return fallback();
    }
  },
  ["asset-by-slug"],
  { revalidate: 180 },
);

export async function getAssetBySlug(slug: string): Promise<AssetDetail | null> {
  return getCachedAssetBySlug(slug);
}

/**
 * Assets for the "Collection" preview blocks.
 *  - default: the curated featured set, ordered by sort_order.
 *  - { latest: true }: the most recently added published assets (homepage shows
 *    only the latest few), ignoring the featured flag.
 *  - { limit }: cap the number returned.
 */
/**
 * Delivery settings from the CMS `delivery` global (single row). Falls back to
 * sensible defaults if the row hasn't been created/saved in admin yet.
 */
const getCachedDeliverySettings = unstable_cache(
  async (region: Region): Promise<DeliverySettings> => {
    const kenyaFallback: DeliverySettings = { ...defaultDeliverySettings, areas: kenyaCounties };
    const virginiaFallback: DeliverySettings = {
      market: "virginia",
      currency: "USD",
      enabled: true,
      message: "Local delivery across Virginia",
      details: "",
      flatFee: 75,
      freeAbove: null,
      countyRates: {},
      tierSurcharges: { standard: 0, medium: 25, large: 60, bulky: 120 },
      fragileSurcharge: 35,
      areas: [],
      areaLabel: "Locality",
      quoteOutsideArea: true,
    };
    const fallback = region === "virginia" ? virginiaFallback : kenyaFallback;

    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("delivery")
        .select(
          "enabled, message, details, flat_fee, free_above, county_rates, tier_surcharges, fragile_surcharge, va_enabled, va_message, va_details, va_flat_fee, va_free_above, va_outside_quote, va_locality_rates, va_tier_surcharges, va_fragile_surcharge",
        )
        .maybeSingle();

      if (error || !data) return fallback;

      if (region === "virginia") {
        const rates = (data.va_locality_rates as Record<string, number> | null) ?? {};
        return {
          market: "virginia",
          currency: "USD",
          enabled: data.va_enabled ?? true,
          message: data.va_message?.trim() || virginiaFallback.message,
          details: data.va_details ?? "",
          flatFee: data.va_flat_fee != null ? Number(data.va_flat_fee) : virginiaFallback.flatFee,
          freeAbove: data.va_free_above != null ? Number(data.va_free_above) : null,
          countyRates: rates,
          tierSurcharges:
            (data.va_tier_surcharges as Record<string, number> | null) ??
            virginiaFallback.tierSurcharges,
          fragileSurcharge:
            data.va_fragile_surcharge != null
              ? Number(data.va_fragile_surcharge)
              : virginiaFallback.fragileSurcharge,
          areas: Object.keys(rates),
          areaLabel: "Locality",
          quoteOutsideArea: data.va_outside_quote ?? true,
        };
      }

      return {
        market: "kenya",
        currency: "KES",
        enabled: data.enabled ?? true,
        message: data.message?.trim() || defaultDeliverySettings.message,
        details: data.details ?? "",
        flatFee: data.flat_fee != null ? Number(data.flat_fee) : defaultDeliverySettings.flatFee,
        freeAbove: data.free_above != null ? Number(data.free_above) : null,
        countyRates:
          (data.county_rates as Record<string, number> | null) ??
          defaultDeliverySettings.countyRates,
        tierSurcharges:
          (data.tier_surcharges as Record<string, number> | null) ??
          defaultDeliverySettings.tierSurcharges,
        fragileSurcharge:
          data.fragile_surcharge != null
            ? Number(data.fragile_surcharge)
            : defaultDeliverySettings.fragileSurcharge,
        areas: kenyaCounties,
        areaLabel: "County",
        quoteOutsideArea: false,
      };
    } catch {
      return fallback;
    }
  },
  ["delivery-settings"],
  { revalidate: 600 },
);

export async function getDeliverySettings(): Promise<DeliverySettings> {
  const region = await getRegion();
  return getCachedDeliverySettings(region);
}

const getCachedFeaturedAssets = unstable_cache(
  async (region: Region, limit: number | "none", latest: boolean): Promise<FeaturedAsset[]> => {
    const opts = { limit: limit === "none" ? undefined : limit, latest };
    const fallback = (): FeaturedAsset[] =>
      region !== "kenya"
        ? []
        : opts.limit
          ? staticAssets.slice(0, opts.limit)
          : staticAssets;
    try {
      const supabase = createPublicClient();
      let query = supabase
        .from("assets")
        .select("slug, title, category, category_other, status, primary_image_url, metadata, sort_order, created_at")
        .eq("_status", "published")
        .eq("market", region);

      query = opts.latest
        ? query.order("created_at", { ascending: false })
        : query.eq("is_featured", true).order("sort_order");

      if (opts.limit) query = query.limit(opts.limit);

      const { data, error } = await query;

      if (error || !data?.length) {
        return fallback();
      }

      return data.map((a, i) => {
        const meta = (a.metadata ?? {}) as { meta?: string; tone?: FeaturedAsset["tone"] };
        const status =
          a.status === "reserved" || a.status === "sold" ? a.status : "available";
        return {
          slug: a.slug ?? "",
          title: a.title ?? "",
          category: categoryDisplay(a.category, a.category_other),
          meta: meta.meta ?? "",
          status,
          tone: meta.tone ?? tones[i % tones.length],
          imageUrl: a.primary_image_url ?? undefined,
        };
      });
    } catch {
      return fallback();
    }
  },
  ["featured-assets"],
  { revalidate: 180 },
);

export async function getFeaturedAssets(
  opts: { limit?: number; latest?: boolean } = {},
): Promise<FeaturedAsset[]> {
  const region = await getRegion();
  return getCachedFeaturedAssets(region, opts.limit ?? "none", opts.latest ?? false);
}

export type ListingDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  condition: string | null;
  location: string | null;
  primary_image_url: string | null;
  views: number;
  created_at: string;
  user_id: string;
  user_profiles: {
    full_name: string | null;
    phone: string | null;
    location: string | null;
    avatar_url: string | null;
  } | null;
};

/**
 * A single active listing, read with the ANON client and cached.
 *
 * Deliberately not the cookie-bound SSR client: an anonymous visitor (and
 * Googlebot) would otherwise force an uncacheable Supabase round trip on every
 * single hit of every listing page, which is exactly the kind of per-request
 * latency that shows up as a poor TTFB in a site audit. RLS already limits
 * anon reads to `status = 'active'`, which is the same filter the page wants.
 * Ownership (the "this is your listing" banner) is resolved separately from
 * the session — it is the only part that varies per visitor.
 */
export const getListingBySlug = unstable_cache(
  async (slug: string): Promise<ListingDetail | null> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("user_listings")
        .select(
          `id, slug, title, description, price, category, condition, location,
           primary_image_url, views, created_at, currency, user_id,
           user_profiles ( full_name, phone, location, avatar_url )`,
        )
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();
      if (error || !data) return null;
      const profile = Array.isArray(data.user_profiles)
        ? data.user_profiles[0] ?? null
        : data.user_profiles;
      return { ...data, user_profiles: profile } as ListingDetail;
    } catch {
      return null;
    }
  },
  ["listing-by-slug"],
  // Tagged so a seller's edit shows up at once instead of waiting out the 60s
  // window (see revalidateListings in app/actions/listings.ts).
  { revalidate: 60, tags: ["listings"] },
);

export type MarketplaceListing = {
  slug: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  condition: string | null;
  location: string | null;
  primary_image_url: string | null;
  views: number;
  user_profiles: { full_name?: string | null } | null;
};

// Marketplace browse/search is the highest-traffic, most-write-volatile page
// on the site — a short cache (vs. no cache at all) is the single biggest
// lever on Postgres load without staling results meaningfully for shoppers.
// Uses the anon client (not the cookie-bound SSR client) so the result is
// cacheable across visitors; RLS already restricts reads to active listings.
const getCachedMarketplaceListings = unstable_cache(
  async (region: Region, category: string, q: string): Promise<MarketplaceListing[]> => {
    try {
      const supabase = createPublicClient();
      let query = supabase
        .from("user_listings")
        .select(
          "slug, title, description, price, currency, category, condition, location, primary_image_url, views, user_profiles ( full_name )",
        )
        .eq("status", "active")
        .eq("currency", regionCurrency[region])
        .order("created_at", { ascending: false })
        .limit(200);

      if (category) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = query.eq("category", category as any);
      }
      if (q) query = query.ilike("title", `%${q}%`);

      const { data, error } = await query;
      // Log instead of swallowing: a bad select (e.g. a missing PostgREST
      // relationship) otherwise renders an empty marketplace silently.
      if (error) console.error("Marketplace query failed:", error.message);
      if (error || !data) return [];

      return data.map((l) => ({
        ...l,
        user_profiles: Array.isArray(l.user_profiles) ? (l.user_profiles[0] ?? null) : l.user_profiles,
      }));
    } catch {
      return [];
    }
  },
  ["marketplace-listings"],
  { revalidate: 60, tags: ["listings"] },
);

export async function getMarketplaceListings(
  region: Region,
  category: string,
  q: string,
): Promise<MarketplaceListing[]> {
  return getCachedMarketplaceListings(region, category, q);
}
