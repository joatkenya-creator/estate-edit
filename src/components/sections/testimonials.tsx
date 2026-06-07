import { Quote } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { getTestimonials } from "@/lib/queries";

export async function Testimonials() {
  const testimonials = await getTestimonials();
  return (
    <section className="gradient-stone py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">In Confidence</p>
          <h2 className="font-display text-4xl font-light text-navy sm:text-5xl text-balance">
            What our clients say
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.author} delay={i}>
              <figure className="hover-lift flex h-full flex-col rounded-xl border border-border bg-white p-8">
                <Quote className="size-9 text-gold/40" strokeWidth={1.2} />
                <blockquote className="mt-5 flex-1 font-display text-lg font-light leading-relaxed text-charcoal text-pretty">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-7 border-t border-border pt-5">
                  <div className="font-medium text-navy">{t.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.role} · {t.location}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
