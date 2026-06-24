import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import {
  services as staticServices,
  statMetrics as staticMetrics,
  testimonials as staticTestimonials,
  featuredAssets as staticAssets,
  assetCategoryLabel,
  defaultDeliverySettings,
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

export async function getTestimonials(): Promise<Testimonial[]> {
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

export async function getCatalogueAssets(): Promise<CatalogueItem[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("assets")
      .select("slug, title, category, category_other, division, status, primary_image_url, metadata, sort_order")
      .eq("_status", "published")
      .order("sort_order");

    if (error || !data?.length) {
      return staticAssets.map((a, i) => ({
        ...a,
        categoryKey: "other",
        division: i % 3 === 2 ? "commercial_liquidation" : "estate_sales",
      }));
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
      };
    });
  } catch {
    return staticAssets.map((a) => ({ ...a, categoryKey: "other", division: "estate_sales" }));
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
        "id, slug, title, description, division, category, category_other, status, condition, price, currency, price_on_request, brand, era, provenance, dimensions, location, primary_image_url, gallery, tags, metadata, delivery_tier, fragile",
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
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("delivery")
      .select(
        "enabled, message, details, flat_fee, free_above, county_rates, tier_surcharges, fragile_surcharge",
      )
      .maybeSingle();

    if (error || !data) return defaultDeliverySettings;

    return {
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
    };
  } catch {
    return defaultDeliverySettings;
  }
}

export async function getFeaturedAssets(
  opts: { limit?: number; latest?: boolean } = {},
): Promise<FeaturedAsset[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("assets")
      .select("slug, title, category, category_other, status, primary_image_url, metadata, sort_order, created_at")
      .eq("_status", "published");

    query = opts.latest
      ? query.order("created_at", { ascending: false })
      : query.eq("is_featured", true).order("sort_order");

    if (opts.limit) query = query.limit(opts.limit);

    const { data, error } = await query;

    if (error || !data?.length) {
      return opts.limit ? staticAssets.slice(0, opts.limit) : staticAssets;
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
    return opts.limit ? staticAssets.slice(0, opts.limit) : staticAssets;
  }
}
