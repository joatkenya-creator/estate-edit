import type { Metadata } from "next";
import { Boxes, Sparkles, House, Handshake, ClipboardList, Package } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { Process } from "@/components/sections/process";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "Downsizing & Relocation Concierge in Nairobi",
  description:
    "White-glove downsizing, relocation, and estate cleanout services in Nairobi, Kenya: property preparation, donation coordination, vendor management, and storage — handled end to end.",
  alternates: { canonical: "/concierge" },
};

export const revalidate = 600;

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
        title="White-glove support for major life changes"
        subtitle="When life shifts (a downsize, a relocation, settling an estate), a single accountable team handles every detail, so the transition feels effortless and dignified."
        crumbs={[{ label: "Concierge" }]}
      />

      <CategoryGrid
        eyebrow="What We Handle"
        heading="Every detail, under one roof"
        intro="From the first box to the final handover, your concierge coordinates the people, logistics, and decisions on your behalf."
        items={services}
      />

      <Process />

      <CtaBand
        title="Facing a major transition?"
        subtitle="Tell us your timeline and we'll build a concierge plan tailored to you, with discretion at every step."
      />
    </main>
  );
}
