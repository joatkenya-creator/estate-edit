import type { Metadata } from "next";
import { Boxes, Sparkles, House, Handshake, ClipboardList, Package } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { Process } from "@/components/sections/process";
import { RelatedServices } from "@/components/sections/related-services";
import { CtaBand } from "@/components/sections/cta-band";
import { getRegion } from "@/lib/region.server";
import { buildOpenGraph, regionAlternates } from "@/lib/seo";

// Region-aware metadata — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const isVa = (await getRegion()) === "virginia";
  const title = "Downsizing & Relocation Concierge";
  const description = isVa
    ? "White-glove downsizing, relocation, and estate cleanout services in Virginia: property preparation, donation coordination, vendor management, and storage."
    : "White-glove downsizing, relocation, and estate cleanout services in Kenya: property preparation, donation coordination, vendor management, and storage.";
  return {
    title,
    description,
    alternates: regionAlternates("/concierge", isVa ? "virginia" : "kenya"),
    openGraph: buildOpenGraph({ title, description, path: "/concierge", region: isVa ? "virginia" : "kenya" }),
  };
}

const services = [
  {
    icon: Boxes,
    title: "Downsizing & Relocation",
    description: "A calm, fully managed move to a smaller home or new chapter, packed, sorted, and settled.",
  },
  {
    icon: Sparkles,
    title: "Estate Cleanouts",
    description: "Complete, respectful clearing of a property, from keepsakes to final broom-clean handover.",
  },
  {
    icon: House,
    title: "Property Preparation",
    description: "Staging, repairs, and presentation so a home shows at its best for sale or handover.",
  },
  {
    icon: Handshake,
    title: "Donation Coordination",
    description: "Items placed with the right charities and causes, with documentation for your records.",
  },
  {
    icon: ClipboardList,
    title: "Vendor Management",
    description: "Movers, cleaners, and tradespeople sourced, scheduled, and supervised on your behalf.",
  },
  {
    icon: Package,
    title: "Storage Solutions",
    description: "Secure short- and long-term storage for belongings during and after the transition.",
  },
];

export default function ConciergePage() {
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Concierge Transition Services"
        title="Downsizing & Relocation Concierge"
        subtitle="When life shifts (a downsize, a relocation, or settling an estate), a single accountable team handles every detail, so the transition feels effortless and dignified."
        crumbs={[{ label: "Concierge" }]}
      />

      <CategoryGrid
        eyebrow="What We Handle"
        heading="Every detail, under one roof"
        intro="From the first box to the final handover, your concierge coordinates the people, logistics, and decisions on your behalf."
        items={services}
      />

      <Process />

      <RelatedServices current="concierge" />

      <CtaBand
        title="Facing a major transition?"
        subtitle="Tell us your timeline and we'll build a concierge plan tailored to you, with discretion at every step."
      />
    </main>
  );
}
