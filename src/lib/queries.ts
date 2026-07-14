import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { getRegion } from "@/lib/region.server";
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

export async function getServices(): Promise<Service[]> {
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
}

export async function getStats(): Promise<Metric[]> {
  // Virginia: fixed localised stats (no KES client-value figure). Kenya: CMS.
  if ((await getRegion()) === "virginia") return regionContent.virginia.stats;
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
}

/**
 * All current testimonials (DB and static fallback) are Kenya clients — the
 * `testimonials` table has no region column to filter by. Rather than show
 * Nairobi social proof to Virginia visitors, withhold the section there until
 * real Virginia quotes exist.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  if ((await getRegion()) === "virginia") return [];
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
 * All active marketplace listing slugs, across both markets, for the
 * sitemap. Region-agnostic, so it is safe to call at build time.
 */
export async function getAllListingSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("user_listings")
      .select("slug")
      .eq("status", "active");
    if (error || !data?.length) return [];
    return data.map((l) => l.slug).filter((s): s is string => Boolean(s));
  } catch {
    return [];
  }
}

export async function getCatalogueAssets(): Promise<CatalogueItem[]> {
  const region = await getRegion();
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
}

export async function getAssetBySlug(slug: string): Promise<AssetDetail | null> {
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
export async function getDeliverySettings(): Promise<DeliverySettings> {
  const region = await getRegion();

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
}

export async function getFeaturedAssets(
  opts: { limit?: number; latest?: boolean } = {},
): Promise<FeaturedAsset[]> {
  const region = await getRegion();
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
}
