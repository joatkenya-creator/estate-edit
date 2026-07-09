import { type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Facebook/Google-catalog product feed (CSV) of published, priced items for a
 * market. Paste the URL into Facebook Commerce Manager or Google Merchant to
 * bulk-list — e.g. /feed/facebook?market=kenya (default) or ?market=virginia.
 */

type Row = {
  slug: string | null;
  title: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  status: string | null;
  condition: string | null;
  brand: string | null;
  primary_image_url: string | null;
};

const q = (v: string) => `"${String(v).replace(/"/g, '""').replace(/\s+/g, " ").trim()}"`;

export async function GET(request: NextRequest) {
  const market = new URL(request.url).searchParams.get("market") === "virginia" ? "virginia" : "kenya";
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("assets")
    .select("slug, title, description, price, currency, status, condition, brand, primary_image_url")
    .eq("_status", "published")
    .eq("market", market)
    .not("price", "is", null)
    .eq("price_on_request", false);

  const header = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
  ].join(",");

  const rows = ((data as Row[] | null) ?? [])
    .filter((r) => r.slug && r.title && r.primary_image_url && r.price != null)
    .map((r) => {
      const availability = r.status === "available" ? "in stock" : "out of stock";
      const condition = r.condition === "new" ? "new" : "used";
      const price = `${Number(r.price).toFixed(2)} ${r.currency || (market === "virginia" ? "USD" : "KES")}`;
      return [
        q(r.slug!),
        q(r.title!),
        q(r.description || r.title!),
        q(availability),
        q(condition),
        q(price),
        q(`${SITE_URL}/collection/${r.slug}?utm_source=facebook&utm_medium=catalog`),
        q(r.primary_image_url!),
        q(r.brand || "The Estate Edit"),
      ].join(",");
    });

  const csv = [header, ...rows].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `inline; filename="estate-edit-${market}.csv"`,
      "Cache-Control": "public, max-age=600",
    },
  });
}
