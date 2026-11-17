import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, MessageCircle, Phone, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEVELOPMENTS_WHATSAPP, siteConfig } from "@/lib/site";
import { getCompany } from "@/lib/companies";
import {
  bedBathLabel,
  developmentEnquireHref,
  developmentHref,
  formatPrice,
  formatSize,
  whatsappText,
  type Development,
  type UnitType,
} from "@/lib/developments";

export const whatsappHref = (d: Development, u?: UnitType) =>
  `https://wa.me/${DEVELOPMENTS_WHATSAPP}?text=${encodeURIComponent(whatsappText(d, u))}`;

export function developerOf(d: Development) {
  // Validated at build time (developments.ts), so this always resolves.
  const c = getCompany(d.developer)!;
  return { ...c, legalName: c.legalName ?? c.name };
}

/** Book a viewing · Request brochure · WhatsApp. */
export function DevelopmentCtas({ dev, unit, dark = false }: { dev: Development; unit?: UnitType; dark?: boolean }) {
  const outline = dark
    ? "border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
    : "border-navy/30 text-navy hover:bg-navy/5";
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button asChild size="lg" className="group h-13 bg-gold px-7 text-base text-navy hover:bg-gold-soft">
        <Link href={developmentEnquireHref(dev, unit, "viewing")}>
          <CalendarDays className="size-4" aria-hidden="true" />
          Book a viewing
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline" className={cn("h-13 px-7 text-base", outline)}>
        <Link href={developmentEnquireHref(dev, unit, "brochure")}>
          <FileText className="size-4" aria-hidden="true" />
          Request brochure
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline" className={cn("h-13 px-7 text-base", outline)}>
        <a href={whatsappHref(dev, unit)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </Button>
    </div>
  );
}

/** Brief 6: attribution + brochure disclaimer, on every development page. */
export function Attribution({ dev }: { dev: Development }) {
  const developer = developerOf(dev);
  return (
    <section className="border-t border-border bg-stone py-10">
      <div className="mx-auto max-w-7xl space-y-3 px-5 text-sm text-charcoal/75 sm:px-8">
        <p>
          A project by{" "}
          <Link href={`/developers/${developer.slug}`} className="font-medium text-navy underline-offset-4 hover:underline">
            {developer.legalName}
          </Link>
          . Marketed by The Estate Edit.
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{dev.disclaimer}</p>
      </div>
    </section>
  );
}

/** Mobile-only bar: Call · WhatsApp · Book viewing. Pages add bottom padding for it. */
export function MobileBar({ dev, unit }: { dev: Development; unit?: UnitType }) {
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium";
  return (
    <nav
      aria-label={`Contact about ${dev.name}`}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgba(0,35,73,0.25)] md:hidden"
    >
      <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} className={cn(item, "text-navy")}>
        <Phone className="size-4" aria-hidden="true" />
        Call
      </a>
      <a href={whatsappHref(dev, unit)} target="_blank" rel="noopener noreferrer" className={cn(item, "text-navy")}>
        <MessageCircle className="size-4" aria-hidden="true" />
        WhatsApp
      </a>
      <Link href={developmentEnquireHref(dev, unit, "viewing")} className={cn(item, "bg-navy text-white")}>
        <CalendarDays className="size-4" aria-hidden="true" />
        Book viewing
      </Link>
    </nav>
  );
}

/**
 * The slot a 3D animation or floor plan fills once media is hosted (brief 4,
 * step 5). Always carries the artist's-impression label.
 */
export function MediaSlot({ label, aspect = "aspect-video", className }: { label: string; aspect?: string; className?: string }) {
  return (
    <figure className={cn("relative overflow-hidden rounded-xl bg-lotus-green", aspect, className)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-lotus-pink/70 text-lotus-pink">
          <Play className="size-4 translate-x-0.5" strokeWidth={1.6} />
        </span>
        <p className="px-4 text-xs uppercase tracking-[0.2em] text-white/80">{label}: coming soon</p>
      </div>
      <figcaption className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-0.5 text-[11px] text-white">
        3D animation, artist&apos;s impression
      </figcaption>
    </figure>
  );
}

export function UnitTypeCard({ dev, unit }: { dev: Development; unit: UnitType }) {
  return (
    <article className="hover-lift flex flex-col overflow-hidden rounded-xl border border-border bg-white">
      <MediaSlot label={unit.name} aspect="aspect-[4/3]" className="rounded-none" />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl text-navy">{unit.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{bedBathLabel(unit)}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Size</dt>
            <dd className="mt-0.5 font-medium text-navy">{formatSize(unit.sizeSqft)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Homes</dt>
            <dd className="mt-0.5 font-medium text-navy">{unit.unitCount}</dd>
          </div>
        </dl>
        <p className="mt-4 font-medium text-charcoal">{formatPrice(unit.priceFromKes)}</p>
        <Link
          href={developmentHref(dev, unit)}
          className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-medium text-navy underline-offset-4 hover:text-gold hover:underline"
        >
          Explore<span className="sr-only"> the {unit.name}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
