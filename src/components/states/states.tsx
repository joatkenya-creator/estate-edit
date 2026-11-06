import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Interface states shared across the site. Server-safe (no hooks), so pages,
 * loading.tsx files and client components can all render them. The pieces
 * that need the browser (focus, region, connection) live in form-states.tsx.
 */

type Action = { label: string; href: string };

const primaryBtn =
  "inline-flex h-11 items-center justify-center rounded-lg bg-navy px-6 text-sm font-medium text-white transition-colors hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const secondaryLink = "text-sm text-navy underline-offset-4 hover:underline";

/** Why it's empty, then exactly one next step. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  /** A link, or any element (e.g. a button that opens a form). One only. */
  action?: Action | React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-white px-6 py-14 text-center shadow-sm sm:py-20",
        className,
      )}
    >
      {icon && <div className="mx-auto mb-4 flex justify-center text-charcoal/25 [&_svg]:size-11">{icon}</div>}
      <p className="font-display text-xl text-navy sm:text-2xl text-balance">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60 text-pretty">{body}</p>}
      {action && (
        <div className="mt-6">
          {isAction(action) ? (
            <Link href={action.href} className={primaryBtn}>
              {action.label}
            </Link>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}

function isAction(a: unknown): a is Action {
  return typeof a === "object" && a !== null && "href" in a && "label" in a && !("$$typeof" in a);
}

/**
 * Full-width message for errors, removed listings and permission walls: what
 * happened, then one clear way forward (plus an optional quiet secondary link).
 */
export function StatePanel({
  eyebrow,
  title,
  children,
  primary,
  secondary,
  as: Tag = "h1",
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  primary?: Action | React.ReactNode;
  secondary?: Action;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mx-auto max-w-xl text-center">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Tag className="font-display text-3xl font-light leading-tight text-navy sm:text-4xl text-balance">
        {title}
      </Tag>
      {children && (
        <div className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-charcoal/70 sm:text-base text-pretty">
          {children}
        </div>
      )}
      {(primary || secondary) && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          {primary &&
            (isAction(primary) ? (
              <Link href={primary.href} className={primaryBtn}>
                {primary.label}
              </Link>
            ) : (
              primary
            ))}
          {secondary && (
            <Link href={secondary.href} className={secondaryLink}>
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeletons: same boxes as the real cards, so nothing shifts when they swap.  */
/* -------------------------------------------------------------------------- */

/** Pulse that stops for people who ask for reduced motion. */
const pulse = "animate-pulse motion-reduce:animate-none";
const bar = "rounded bg-stone-deep";

/** Mirrors components/listings/listing-card.tsx. */
export function ListingCardSkeleton() {
  return (
    <div aria-hidden className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm", pulse)}>
      <div className="aspect-[4/3] w-full bg-stone-deep" />
      <div className="flex flex-1 flex-col p-4">
        <div className={cn(bar, "h-5 w-4/5")} />
        <div className="mt-2 flex gap-1.5">
          <div className={cn(bar, "h-5 w-16 rounded-full")} />
          <div className={cn(bar, "h-5 w-12 rounded-full")} />
        </div>
        <div className={cn(bar, "mt-3 h-3 w-full")} />
        <div className="pt-3">
          <div className={cn(bar, "h-6 w-28")} />
          <div className="mt-2 flex justify-between">
            <div className={cn(bar, "h-3 w-24")} />
            <div className={cn(bar, "h-3 w-8")} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mirrors the Collection lot card (portrait image with text over it). */
export function LotCardSkeleton() {
  return (
    <div aria-hidden className={cn("relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-deep", pulse)}>
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
        <div className="h-2.5 w-16 rounded bg-white/60" />
        <div className="mt-2 h-5 w-3/4 rounded bg-white/70" />
        <div className="mt-1.5 h-3 w-1/2 rounded bg-white/50" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LotGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <LotCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Navy page header used by Marketplace, Collection and category pages. */
export function HeroSkeleton() {
  return (
    <div className="bg-navy pb-10 pt-28 sm:pb-12 sm:pt-36" aria-hidden>
      <div className={cn("mx-auto flex max-w-3xl flex-col items-center px-5", pulse)}>
        <div className="h-3 w-40 rounded bg-white/15" />
        <div className="mt-5 h-9 w-4/5 rounded bg-white/15 sm:h-12" />
        <div className="mt-4 h-4 w-3/5 rounded bg-white/10" />
      </div>
    </div>
  );
}

/** Lot / listing detail: image left, facts and enquiry box right. */
export function DetailSkeleton() {
  return (
    <main className="flex-1 bg-stone" aria-busy="true">
      <div className={cn("mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28", pulse)} aria-hidden>
        <div className={cn(bar, "mb-6 h-4 w-64 max-w-full")} />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="aspect-[4/3] w-full rounded-xl bg-stone-deep" />
            <div className={cn(bar, "mt-6 h-4 w-full")} />
            <div className={cn(bar, "mt-2 h-4 w-11/12")} />
            <div className={cn(bar, "mt-2 h-4 w-2/3")} />
          </div>
          <div className="h-fit rounded-xl border border-border bg-white p-6">
            <div className={cn(bar, "h-4 w-24")} />
            <div className={cn(bar, "mt-3 h-8 w-4/5")} />
            <div className={cn(bar, "mt-4 h-7 w-32")} />
            <div className={cn(bar, "mt-6 h-11 w-full rounded-lg")} />
            <div className={cn(bar, "mt-3 h-11 w-full rounded-lg")} />
          </div>
        </div>
      </div>
      <span className="sr-only" role="status">Loading</span>
    </main>
  );
}
