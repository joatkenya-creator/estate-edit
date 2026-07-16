import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { CollectionGrid } from "@/components/sections/collection-grid";
import { RelatedServices } from "@/components/sections/related-services";
import { CtaBand } from "@/components/sections/cta-band";
import { NewArrivalsSignup } from "@/components/marketing/new-arrivals-signup";
import { getCatalogueAssets } from "@/lib/queries";
import { getRegion } from "@/lib/region.server";
import { buildOpenGraph, regionAlternates } from "@/lib/seo";

// Region-specific catalogue (Kenya vs Virginia) — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const isVa = (await getRegion()) === "virginia";
  const title = isVa
    ? "Luxury Assets for Sale in Virginia"
    : "Luxury Assets for Sale in Kenya";
  const description = isVa
    ? "A curated catalogue of luxury estate and commercial assets for sale across Virginia — furniture, vehicles, fine art, jewellery, and equipment."
    : "A curated catalogue of luxury estate and commercial assets for sale across Kenya and internationally — furniture, vehicles, fine art, and jewellery.";
  return {
    title,
    description,
    alternates: regionAlternates("/collection", isVa ? "virginia" : "kenya"),
    openGraph: buildOpenGraph({ title, description, path: "/collection", region: isVa ? "virginia" : "kenya" }),
  };
}

export default async function CollectionPage() {
  const isVa = (await getRegion()) === "virginia";
  const assets = await getCatalogueAssets();

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="The Collection"
        title={isVa ? "Luxury Assets for Sale in Virginia" : "Luxury Assets for Sale in Kenya & Worldwide"}
        subtitle={
          isVa
            ? "A curated catalogue from active estates and commercial liquidations across Virginia: furniture, vehicles, fine art, jewellery, and equipment. Open to buyers across the state. Filter by division and category, then enquire in confidence."
            : "A curated catalogue from active estates and commercial liquidations across Kenya: furniture, vehicles, fine art, jewellery, and equipment. Open to buyers countrywide and internationally. Filter by division and category, then enquire in confidence."
        }
        crumbs={[{ label: "Collection" }]}
      />
      <CollectionGrid items={assets} />
      <NewArrivalsSignup source="collection" />
      <RelatedServices current="collection" />
      <CtaBand
        title="Seeking something in particular?"
        subtitle="Tell us what you're looking for and we'll match it from current and upcoming estates."
      />
    </main>
  );
}
