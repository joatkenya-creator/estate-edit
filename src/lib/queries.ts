import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import {
  services as staticServices,
  statMetrics as staticMetrics,
  testimonials as staticTestimonials,
  featuredAssets as staticAssets,
  assetCategoryLabel,
  type Service,
  type Metric,
  type Testimonial,
  type FeaturedAsset,
  type CatalogueItem,
} from "@/lib/site";

/**
 * Data-access layer for the public site. Each function reads published content
 * from Supabase and falls back to the curated static content in `site.ts` if
 * the table is empty or the request fails — so the page always renders.
 */

export async function getServices(): Promise<Service[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("services")
      .select("slug, division, title, summary, icon, offerings")
      .eq("is_published", true)
      .order("sort_order");

    if (error || !data?.length) return staticServices;

    return data.map((s) => ({
      slug: s.slug,
      division: s.division,
      icon: (s.icon ?? "estate") as Service["icon"],
      title: s.title,
      summary: s.summary ?? "",
      offerings: s.offerings ?? [],
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
      .eq("is_published", true)
      .order("sort_order");

    if (error || !data?.length) return staticMetrics;

    return data.map((s) => {
      const value = Number(s.value);
      return {
        to: value,
        prefix: s.prefix ?? undefined,
        suffix: s.suffix ?? undefined,
        decimals: Number.isInteger(value) ? 0 : 1,
        label: s.label,
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
      .eq("is_published", true)
      .order("sort_order");

    if (error || !data?.length) return staticTestimonials;

    return data.map((t) => ({
      quote: t.quote,
      author: t.author_name,
      role: t.author_role ?? "",
      location: t.location ?? "",
    }));
  } catch {
    return staticTestimonials;
  }
}

const tones: FeaturedAsset["tone"][] = ["navy", "charcoal", "crimson", "gold"];

export async function getCatalogueAssets(): Promise<CatalogueItem[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("assets")
      .select("slug, title, category, division, status, primary_image_url, metadata, sort_order")
      .eq("is_published", true)
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
        slug: a.slug,
        title: a.title,
        category: assetCategoryLabel[a.category] ?? a.category,
        categoryKey: a.category,
        division: a.division,
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

export async function getFeaturedAssets(): Promise<FeaturedAsset[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("assets")
      .select("slug, title, category, status, primary_image_url, metadata, sort_order")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("sort_order");

    if (error || !data?.length) return staticAssets;

    return data.map((a, i) => {
      const meta = (a.metadata ?? {}) as { meta?: string; tone?: FeaturedAsset["tone"] };
      const status =
        a.status === "reserved" || a.status === "sold" ? a.status : "available";
      return {
        slug: a.slug,
        title: a.title,
        category: assetCategoryLabel[a.category] ?? a.category,
        meta: meta.meta ?? "",
        status,
        tone: meta.tone ?? tones[i % tones.length],
        imageUrl: a.primary_image_url ?? undefined,
      };
    });
  } catch {
    return staticAssets;
  }
}
