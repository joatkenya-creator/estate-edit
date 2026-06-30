import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { CollectionGrid } from "@/components/sections/collection-grid";
import { RelatedServices } from "@/components/sections/related-services";
import { CtaBand } from "@/components/sections/cta-band";
import { getCatalogueAssets } from "@/lib/queries";
import { getRegion } from "@/lib/region.server";

// Region-specific catalogue (Kenya vs Virginia) — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const isVa = (await getRegion()) === "virginia";
  return {
    title: isVa
      ? "Luxury Assets for Sale in Virginia"
      : "Luxury Assets for Sale in Kenya & Worldwide",
    description: isVa
      ? "Browse luxury estate and commercial assets for sale across Virginia: furniture, vehicles, fine art, jewellery, and equipment from active estates and liquidations. Local Virginia delivery. Enquire in confidence."
      : "Browse luxury estate and commercial assets for sale across Kenya and to international buyers: furniture, vehicles, fine art, jewellery, and equipment from active estates and liquidations. Countrywide delivery. Enquire in confidence.",
    alternates: { canonical: "/collection" },
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
      <RelatedServices current="collection" />
      <CtaBand
        title="Seeking something in particular?"
        subtitle="Tell us what you're looking for and we'll match it from current and upcoming estates."
      />
    </main>
  );
}
