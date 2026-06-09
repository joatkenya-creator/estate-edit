import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { CollectionGrid } from "@/components/sections/collection-grid";
import { CtaBand } from "@/components/sections/cta-band";
import { getCatalogueAssets } from "@/lib/queries";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Browse the current collection of luxury estate and commercial assets: furniture, vehicles, fine art, jewellery, and equipment available across Nairobi.",
};

export const revalidate = 600;

export default async function CollectionPage() {
  const assets = await getCatalogueAssets();

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="The Collection"
        title="A curated catalogue of exceptional assets"
        subtitle="From active estates and commercial liquidations across Nairobi. Filter by division and category, then enquire in confidence."
        crumbs={[{ label: "Collection" }]}
      />
      <CollectionGrid items={assets} />
      <CtaBand
        title="Seeking something in particular?"
        subtitle="Tell us what you're looking for and we'll match it from current and upcoming estates."
      />
    </main>
  );
}
