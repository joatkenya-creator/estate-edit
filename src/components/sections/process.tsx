import { Reveal } from "@/components/motion/reveal";
import { processSteps } from "@/lib/site";

export function Process() {
  return (
    <section id="process" className="gradient-stone py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">The Engagement</p>
          <h2 className="font-display text-4xl font-light text-navy sm:text-5xl text-balance">
            A composed, five-step process
          </h2>
          <p className="mt-5 text-muted-foreground">
            From first conversation to final handover, every detail managed on your behalf.
          </p>
        </Reveal>

        <div className="relative mt-20">
          {/* connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent lg:block" />

          <ol className="grid gap-12 lg:grid-cols-5 lg:gap-6">
            {processSteps.map((step, i) => (
              <Reveal as="li" key={step.index} delay={i} className="relative">
                <div className="relative z-10 mb-6 flex size-14 items-center justify-center rounded-full border border-gold/40 bg-white font-display text-lg text-navy shadow-[0_10px_30px_-12px_rgba(0,35,73,0.3)]">
                  {step.index}
                </div>
                <h3 className="font-display text-xl text-navy">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
