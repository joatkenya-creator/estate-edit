import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export function PageHero({
  eyebrow,
  title,
  subtitle,
  crumbs = [],
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative isolate overflow-hidden gradient-navy">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:36px_36px]" />
      <div className="pointer-events-none absolute -right-24 top-0 size-[28rem] rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-24 bottom-0 size-[24rem] rounded-full bg-crimson/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 sm:pb-24 sm:pt-44">
        <nav className="mb-6 flex items-center gap-2 text-xs text-white/55">
          <Link href="/" className="transition-colors hover:text-gold">
            Home
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-2">
              <ChevronRight className="size-3.5" />
              {c.href ? (
                <Link href={c.href} className="transition-colors hover:text-gold">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white/80">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="max-w-3xl font-display text-4xl font-light leading-[1.05] text-white text-balance sm:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 text-pretty sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
