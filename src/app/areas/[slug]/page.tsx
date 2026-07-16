import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { House, Warehouse, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { FeaturedAssets } from "@/components/sections/featured-assets";
import { CtaBand } from "@/components/sections/cta-band";
import { getRegion } from "@/lib/region.server";
import { areaSlug } from "@/lib/region";
import { regionContent } from "@/lib/site";
import { buildOpenGraph, regionAlternates } from "@/lib/seo";

// Region-specific area list, so it must render per request.
export const dynamic = "force-dynamic";

/** Resolve the requested slug to a real "Areas Served" locality for the current region, or null. */
async function resolveArea(slug: string) {
  const region = await getRegion();
  const area = regionContent[region].areasServed.find((a) => areaSlug(a) === slug);
  return area ? { region, area } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveArea(slug);
  if (!resolved) return { title: "Area not found" };

  const { region, area } = resolved;
  const place = region === "virginia" ? "Virginia" : "Nairobi";
  const title = `${area} Estate Sales & Liquidation`;
  const description = `Luxury estate sales, liquidation, and concierge transitions for families and businesses in ${area}, ${place} — discreet valuation, marketing, and sale.`;

  return {
    title,
    description,
    alternates: regionAlternates(`/areas/${slug}`, region),
    openGraph: buildOpenGraph({ title, description, path: `/areas/${slug}`, region }),
  };
}

const CATEGORIES = [
  {
    icon: House,
    title: "Estate Sales",
    description:
      "Full-service management and sale of luxury households, inherited estates, fine art, jewellery, and collector vehicles.",
  },
  {
    icon: Warehouse,
    title: "Commercial Liquidation",
    description:
      "Discreet, value-maximising disposal of business assets for closures, relocations, and fleet or warehouse reductions.",
  },
  {
    icon: Users,
    title: "Concierge Transition",
    description:
      "White-glove support for major life changes: downsizing, relocation, cleanouts, and complete property preparation.",
  },
];

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveArea(slug);
  if (!resolved) notFound();

  const { region, area } = resolved;
  const content = regionContent[region];

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Areas Served"
        title={`Estate Sales & Liquidation in ${area}`}
        subtitle={`${content.lede} Serving families, executors, and businesses in ${area} and across ${content.serves}.`}
        crumbs={[{ label: "Areas Served" }, { label: area }]}
      />

      <CategoryGrid
        eyebrow="What We Handle"
        heading={`Our services in ${area}`}
        intro={`Every engagement in ${area} is catalogued, valued, and marketed to a private network of qualified buyers.`}
        items={CATEGORIES}
      />

      <FeaturedAssets />
      <CtaBand
        title={`Ready to begin in ${area}?`}
        subtitle="Begin with a private, no-obligation consultation. Our concierge team responds within one business day."
      />
    </main>
  );
}
