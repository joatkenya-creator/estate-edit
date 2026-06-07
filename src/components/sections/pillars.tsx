import { Crown, Building2, ConciergeBell, ArrowUpRight, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { type Service } from "@/lib/site";
import { getServices } from "@/lib/queries";

const icons: Record<Service["icon"], LucideIcon> = {
  estate: Crown,
  commercial: Building2,
  concierge: ConciergeBell,
};

export async function Pillars() {
  const services = await getServices();
  return (
    <section id="services" className="relative gradient-stone py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Three divisions · one premium brand</p>
          <h2 className="font-display text-4xl font-light text-navy sm:text-5xl text-balance">
            Most firms offer one service.
            <br />
            <span className="italic text-gold">We offer all three.</span>
          </h2>
          <div className="mx-auto mt-8 h-px w-24 gradient-hairline" />
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = icons[service.icon] ?? Crown;
            return (
              <Reveal key={service.slug} delay={i} className="h-full">
                <article className="hover-lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white p-8 shadow-[0_1px_0_rgba(0,35,73,0.04)]">
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-soft to-gold transition-transform duration-500 group-hover:scale-x-100" />

                  <div className="mb-7 flex size-14 items-center justify-center rounded-lg bg-navy text-gold transition-colors duration-500 group-hover:bg-crimson group-hover:text-white">
                    <Icon className="size-7" strokeWidth={1.4} />
                  </div>

                  <h3 className="font-display text-2xl text-navy">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {service.summary}
                  </p>

                  <ul className="mt-6 grid gap-2.5">
                    {service.offerings.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-charcoal/80">
                        <Check className="size-4 shrink-0 text-gold" strokeWidth={2} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-navy transition-colors group-hover:text-crimson"
                  >
                    Enquire about {service.title.toLowerCase()}
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
