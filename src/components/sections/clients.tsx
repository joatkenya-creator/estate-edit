import Link from "next/link";
import { PlaneLanding, PlaneTakeoff, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { clientTypes } from "@/lib/site";

const expat = [
  {
    icon: PlaneLanding,
    title: "Moving to Kenya",
    points: [
      "Furnished housing assistance",
      "Furniture & vehicle sourcing",
      "School recommendations",
      "Trusted vendor referrals",
    ],
  },
  {
    icon: PlaneTakeoff,
    title: "Leaving Kenya",
    points: [
      "Household liquidation",
      "Vehicle sales & estate inventory",
      "Lease transition & donations",
      "Storage & relocation support",
    ],
  },
];

export function Clients() {
  return (
    <section id="clients" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Who We Serve</p>
          <h2 className="font-display text-4xl font-light text-navy sm:text-5xl text-balance">
            Trusted across every kind of transition
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {clientTypes.map((client, i) => (
            <Reveal key={client.title} delay={i % 3}>
              <div className="group h-full bg-white p-7 transition-colors duration-500 hover:bg-stone">
                <div className="mb-3 h-px w-8 bg-gold transition-all duration-500 group-hover:w-14" />
                <h3 className="font-display text-xl text-navy">{client.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {client.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Expat services feature */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {expat.map((block, i) => {
            const Icon = block.icon;
            return (
              <Reveal key={block.title} delay={i}>
                <div className="hover-lift relative h-full overflow-hidden rounded-xl gradient-navy p-8 text-white">
                  <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-gold/10 blur-2xl" />
                  <div className="relative">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-white/10 text-gold">
                      <Icon className="size-6" strokeWidth={1.5} />
                    </div>
                    <p className="eyebrow mb-2">Expat Services</p>
                    <h3 className="font-display text-2xl text-white">{block.title}</h3>
                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {block.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-white/75">
                          <span className="size-1.5 rounded-full bg-gold" />
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

        <Reveal className="mt-10 flex justify-center">
          <Button asChild size="lg" className="group h-12 bg-navy px-8 text-white hover:bg-navy-soft">
            <Link href="/expat-services">
              Discuss your relocation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
