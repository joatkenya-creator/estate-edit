import type { Metadata } from "next";
import { PlaneLanding, PlaneTakeoff, House, Car, GraduationCap, Handshake, Boxes, Compass } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { RelatedServices } from "@/components/sections/related-services";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { getRegion } from "@/lib/region.server";
import { regionContent } from "@/lib/site";

// Region-aware copy + metadata — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const isVa = (await getRegion()) === "virginia";
  return {
    title: isVa ? "Expat Relocation Services in Virginia" : "Expat Relocation Services in Kenya",
    description: isVa
      ? "Relocation support for expatriates and families moving between Virginia and abroad: furnished housing, sourcing, and school guidance on arrival; household liquidation, vehicle sales, and storage on departure."
      : "Relocation support for expatriates moving between Kenya and abroad, including the USA: furnished housing, sourcing, and school guidance on arrival; household liquidation, vehicle sales, and storage on departure.",
    alternates: { canonical: "/expat-services" },
  };
}

const directions = [
  {
    icon: PlaneLanding,
    label: "Moving to Kenya",
    title: "Arrival Services",
    blurb: "Land softly. We prepare your home and life in Kenya before you arrive.",
    points: [
      "Furnished housing assistance",
      "Furniture sourcing",
      "Vehicle sourcing",
      "School recommendations",
      "Trusted vendor referrals",
      "Relocation support",
    ],
  },
  {
    icon: PlaneTakeoff,
    label: "Leaving Kenya",
    title: "Departure Services",
    blurb: "Leave seamlessly. We handle your household, assets, and logistics end to end.",
    points: [
      "Household liquidation",
      "Vehicle sales",
      "Estate inventory",
      "Lease transition assistance",
      "Donation management",
      "Storage solutions",
    ],
  },
];

const support = [
  { icon: House, title: "Furnished Housing", description: "Move-in-ready homes in Kenya's premier neighbourhoods." },
  { icon: Car, title: "Vehicle Sourcing & Sales", description: "Acquire on arrival or sell on departure, fully managed." },
  { icon: GraduationCap, title: "School Guidance", description: "Recommendations across leading international schools." },
  { icon: Handshake, title: "Vendor Referrals", description: "A vetted network of trusted local service providers." },
  { icon: Boxes, title: "Storage Solutions", description: "Secure short- and long-term storage for your belongings." },
  { icon: Compass, title: "Relocation Support", description: "A single point of contact for your entire transition." },
];

export default async function ExpatServicesPage() {
  const region = await getRegion();
  const isVa = region === "virginia";
  const place = regionContent[region].place;
  const localizedDirections = directions.map((d) => ({
    ...d,
    label: d.label.replace("Kenya", place),
    blurb: d.blurb.replace("Kenya", place),
  }));
  const localizedSupport = support.map((s) => ({
    ...s,
    description: s.description.replace("Kenya", place),
  }));
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Expat Services"
        title="Expat Relocation Services"
        subtitle={
          isVa
            ? "For expatriates and families relocating between Virginia and abroad, we manage the estate, the logistics, and the everyday details, so your move feels effortless."
            : "For expatriates and families relocating between Kenya and abroad (including the USA), we manage the estate, the logistics, and the everyday details, so your move feels effortless."
        }
        crumbs={[{ label: "Expat Services" }]}
      />

      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-2">
          {localizedDirections.map((d, i) => {
            const Icon = d.icon;
            return (
              <Reveal key={d.title} delay={i}>
                <div className="hover-lift relative h-full overflow-hidden rounded-2xl gradient-navy p-9 text-white">
                  <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-gold/10 blur-2xl" />
                  <div className="relative">
                    <div className="mb-6 flex size-14 items-center justify-center rounded-lg bg-white/10 text-gold">
                      <Icon className="size-7" strokeWidth={1.4} />
                    </div>
                    <p className="eyebrow mb-2">{d.label}</p>
                    <h2 className="font-display text-2xl text-white sm:text-3xl">{d.title}</h2>
                    <p className="mt-3 text-sm text-white/70 text-pretty">{d.blurb}</p>
                    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {d.points.map((p) => (
                        <li key={p} className="flex items-center gap-2.5 text-sm text-white/80">
                          <span className="size-1.5 shrink-0 rounded-full bg-gold" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <CategoryGrid
        eyebrow="Relocation Support"
        heading="Everything handled, under one roof"
        items={localizedSupport}
        tone="stone"
      />

      <RelatedServices current="expat-services" />

      <CtaBand
        title={isVa ? "Relocating to or from Virginia?" : "Relocating to or from Kenya?"}
        subtitle="Tell us your timeline and we will build a relocation plan tailored to your family or assignment."
        secondary={null}
      />
    </main>
  );
}
