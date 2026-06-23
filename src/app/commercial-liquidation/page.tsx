import type { Metadata } from "next";
import {
  HardHat,
  Hotel,
  UtensilsCrossed,
  GraduationCap,
  Warehouse,
  Briefcase,
  Truck,
  ClipboardList,
  Gavel,
  Package,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Commercial Liquidation in Nairobi, Kenya",
  description:
    "Discreet commercial and business asset liquidation in Nairobi, Kenya: equipment and fleet liquidation, office and warehouse clearance, and online auctions for closures, relocations, and downsizing.",
  alternates: { canonical: "/commercial-liquidation" },
};

export const revalidate = 600;

const industries = [
  { icon: HardHat, title: "Construction", description: "Plant, machinery, and site equipment liquidated at scale." },
  { icon: Hotel, title: "Hotels & Hospitality", description: "FF&E, kitchens, and guest-room contents cleared end to end." },
  { icon: UtensilsCrossed, title: "Restaurants", description: "Commercial kitchens, fixtures, and front-of-house assets." },
  { icon: GraduationCap, title: "Schools", description: "Furniture, IT, and facility assets responsibly redistributed." },
  { icon: Warehouse, title: "Warehouses", description: "Racking, inventory, and material-handling equipment." },
  { icon: Briefcase, title: "Professional Offices", description: "Office closures handled discreetly and completely." },
  { icon: Truck, title: "Fleet Sales", description: "Vehicle fleets valued and sold to vetted buyers." },
  { icon: Package, title: "Inventory Disposal", description: "Surplus and discontinued stock cleared efficiently." },
  { icon: Gavel, title: "Bankruptcy & Closures", description: "Court- and creditor-sensitive asset realisation." },
];

const services = [
  { icon: ClipboardList, title: "Asset Inventory & Cataloguing", description: "Every asset documented, valued, and audit-ready." },
  { icon: Gavel, title: "Online Auctions & Direct Sales", description: "Competitive auctions and negotiated private sales." },
  { icon: Truck, title: "Logistics & Clearance", description: "Removal, transport, and complete site hand-back." },
];

export default function CommercialLiquidationPage() {
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Commercial Liquidation"
        title="Business asset sales & liquidation"
        subtitle="Value-maximising, discreet disposal of commercial assets for closures, relocations, downsizing, and bankruptcy, across construction, hospitality, education, and beyond."
        crumbs={[{ label: "Commercial Liquidation" }]}
      />

      <CategoryGrid
        eyebrow="Industries We Serve"
        heading="Liquidation across every sector"
        intro="From a single office closure to a multi-site warehouse clearance, we scale to the project."
        items={industries}
      />

      {/* Service highlight band */}
      <section className="gradient-stone py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-4">How We Deliver</p>
            <h2 className="font-display text-3xl font-light text-navy sm:text-4xl text-balance">
              A managed process, end to end
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i}>
                  <div className="hover-lift h-full rounded-xl gradient-navy p-8 text-white">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-white/10 text-gold">
                      <Icon className="size-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-xl text-white">{s.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/70">{s.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand
        title="Closing, relocating, or downsizing?"
        subtitle="Request a confidential asset review and we will scope the liquidation within one business day."
      />
    </main>
  );
}
