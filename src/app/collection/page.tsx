import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { CollectionGrid } from "@/components/sections/collection-grid";
import { RelatedServices } from "@/components/sections/related-services";
import { CtaBand } from "@/components/sections/cta-band";
import { getCatalogueAssets } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Luxury Assets for Sale in Nairobi",
  description:
    "Browse luxury estate and commercial assets for sale in Nairobi, Kenya: furniture, vehicles, fine art, jewellery, and equipment from active estates and liquidations. Enquire in confidence.",
  alternates: { canonical: "/collection" },
};

export const revalidate = 600;

export default async function CollectionPage() {
  const assets = await getCatalogueAssets();

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="The Collection"
        title="Luxury Assets for Sale in Nairobi"
        subtitle="A curated catalogue from active estates and commercial liquidations across Nairobi — furniture, vehicles, fine art, jewellery, and equipment. Filter by division and category, then enquire in confidence."
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
