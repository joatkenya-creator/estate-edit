import type { Metadata } from "next";
import { ShieldCheck, Sparkles, Medal, Globe2, Banknote, Handshake } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { CategoryGrid } from "@/components/sections/category-grid";
import { Stats } from "@/components/sections/stats";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { getRegion } from "@/lib/region.server";
import { buildOpenGraph } from "@/lib/seo";

// Region-localised copy + stats — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const isVa = (await getRegion()) === "virginia";
  const title = isVa
    ? "About | Veteran-Owned Virginia Estate Firm"
    : "About | Veteran-Owned Estate Sales Firm";
  const description = isVa
    ? "The Estate Edit is a veteran-owned luxury estate sales firm in Virginia, combining valuation, marketing, sale, and logistics under one brand."
    : "The Estate Edit is a veteran-owned luxury estate sales firm in Kenya, combining valuation, marketing, sale, and logistics under one premium brand.";
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: buildOpenGraph({ title, description, path: "/about" }),
  };
}

const values = [
  {
    icon: ShieldCheck,
    title: "Discretion",
    description: "Every engagement is handled in the strictest confidence. Your affairs stay private.",
  },
  {
    icon: Sparkles,
    title: "White-Glove Service",
    description: "A single, accountable team manages every detail from first call to final handover.",
  },
  {
    icon: Medal,
    title: "Veteran-Owned Leadership",
    description: "Disciplined, mission-first leadership with a bias for clarity and follow-through.",
  },
  {
    icon: Globe2,
    title: "International Experience",
    description: "Cross-border business expertise serving expatriates, embassies, and global firms.",
  },
  {
    icon: Banknote,
    title: "Maximised Value",
    description: "Professional valuation and a private buyer network that realise the best outcomes.",
  },
  {
    icon: Handshake,
    title: "Trusted Network",
    description: "Vetted logistics, storage, and vendor partners across Kenya and East Africa.",
  },
];

export default async function AboutPage() {
  const isVa = (await getRegion()) === "virginia";
  const localizedValues = values.map((v) =>
    v.title === "Trusted Network"
      ? {
          ...v,
          description: isVa
            ? "Vetted logistics, storage, and vendor partners across Virginia."
            : "Vetted logistics, storage, and vendor partners across Kenya and East Africa.",
        }
      : v,
  );
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="About The Estate Edit"
        title="A luxury estate & transition management firm"
        subtitle="We help individuals, families, businesses, and expatriates navigate major life transitions, simplifying the complex while maximising value."
        crumbs={[{ label: "About" }]}
      />

      {/* Story + mission */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              <p className="eyebrow mb-4">Our Story</p>
              <h2 className="font-display text-3xl font-light text-navy sm:text-4xl text-balance">
                A new standard for estate transitions.
              </h2>
              <div className="mt-6 space-y-5 text-muted-foreground text-pretty">
                <p>
                  The Estate Edit was founded to bring a genuinely white-glove standard to estate
                  transitions in {isVa ? "Virginia" : "East Africa"}. Where others run a single service, we combine valuation,
                  inventory management, marketing, sales, logistics, and transition support under one
                  premium brand.
                </p>
                <p>
                  We serve individuals, homeowners, estate executors, business
                  owners, and expatriate families, each guided by a discreet, senior team that treats
                  every estate as a portfolio of fine-art lots, not a database of listings.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="relative h-full overflow-hidden rounded-2xl gradient-navy p-9 text-white">
              <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-gold/10 blur-3xl" />
              <div className="relative flex h-full flex-col">
                <p className="eyebrow mb-5">Our Mission</p>
                <p className="font-display text-2xl font-light leading-relaxed text-white text-pretty sm:text-3xl">
                  &ldquo;To simplify complex transitions while maximising value for our clients, with
                  discretion, care, and uncommon attention to detail.&rdquo;
                </p>
                <div className="mt-auto pt-10">
                  <div className="h-px w-24 gradient-hairline" />
                  <p className="mt-5 text-sm text-white/65">
                    Luxury estates. Commercial liquidations. Seamless transitions.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CategoryGrid
        eyebrow="Why Clients Trust Us"
        heading="The standards behind every engagement"
        items={localizedValues}
        tone="stone"
      />

      <Stats />
      <CtaBand />
    </main>
  );
}
