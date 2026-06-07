import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export function CtaBand({
  title = "Ready to simplify your transition?",
  subtitle = "Begin with a private, no-obligation consultation. Our concierge team responds within one business day.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl gradient-navy px-8 py-14 text-center sm:px-16 sm:py-20">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-crimson/10 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-light text-white sm:text-5xl text-balance">
                {title}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-white/70 text-pretty">{subtitle}</p>
              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="group h-13 bg-gold px-8 text-base text-navy hover:bg-gold-soft">
                  <Link href="/contact">
                    Book a Consultation
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 border-white/30 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/contact">Request an Asset Review</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
