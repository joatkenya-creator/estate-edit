import type { Metadata } from "next";
import { House, ScrollText, Gem, Car, Frame, Diamond } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { Process } from "@/components/sections/process";
import { FeaturedAssets } from "@/components/sections/featured-assets";
import { RelatedServices } from "@/components/sections/related-services";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "Luxury Estate Sales in Nairobi, Kenya",
  description:
    "Full-service luxury estate sales and estate liquidation in Nairobi, Kenya: household contents, inherited estates, collectibles, vehicles, fine art, and jewellery, with editorial photography and private buyer outreach.",
  alternates: { canonical: "/estate-sales" },
};

export const revalidate = 600;

const categories = [
  {
    icon: House,
    title: "Luxury Household Sales",
    description: "Complete, white-glove sale of furnishings and contents from distinguished homes.",
  },
  {
    icon: ScrollText,
    title: "Inherited Estates",
    description: "Sensitive, transparent management of estates for executors and families.",
  },
  {
    icon: Gem,
    title: "Collectibles",
    description: "Rare objects, designer pieces, and curiosities matched to discerning collectors.",
  },
  {
    icon: Car,
    title: "Vehicles",
    description: "Collector and executive vehicles, valued and sold to a qualified private network.",
  },
  {
    icon: Frame,
    title: "Artwork",
    description: "Fine art catalogued with provenance and presented like exhibited works.",
  },
  {
    icon: Diamond,
    title: "Jewellery",
    description: "Certified fine jewellery and watches, appraised and discreetly placed.",
  },
];

export default function EstateSalesPage() {
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Estate Sales"
        title="Luxury Estate Sales & Liquidation in Nairobi"
        subtitle="We manage the entire luxury estate sale in Nairobi, from inventory and valuation to editorial marketing and curated estate events, maximising value while you focus on what matters."
        crumbs={[{ label: "Estate Sales" }]}
      />

      <CategoryGrid
        eyebrow="What We Handle"
        heading="Luxury assets, expertly placed"
        intro="Every category is catalogued, valued, and marketed to a private network of qualified buyers across East Africa."
        items={categories}
      />

      <Process />
      <FeaturedAssets />
      <RelatedServices current="estate-sales" />
      <CtaBand />
    </main>
  );
}
