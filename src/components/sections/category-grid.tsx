import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export type CategoryItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function CategoryGrid({
  eyebrow,
  heading,
  intro,
  items,
  tone = "light",
}: {
  eyebrow: string;
  heading: string;
  intro?: string;
  items: CategoryItem[];
  tone?: "light" | "stone";
}) {
  return (
    <section className={tone === "stone" ? "gradient-stone py-24 sm:py-28" : "bg-white py-24 sm:py-28"}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 className="font-display text-3xl font-light text-navy sm:text-4xl text-balance">
            {heading}
          </h2>
          {intro && <p className="mt-5 text-muted-foreground text-pretty">{intro}</p>}
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i % 3}>
                <div className="hover-lift group h-full rounded-xl border border-border bg-white p-7">
                  <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-stone text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-gold">
                    <Icon className="size-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-navy">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
