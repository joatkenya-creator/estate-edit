import Link from "next/link";
import Image from "next/image";
import { getCompany } from "@/lib/companies";
import { coverImage, enquireHref, formatKes, formatSpecs, type Residence } from "@/lib/residences";
import { CompanyLogo, MediaPlaceholder, StatusBadge } from "@/components/residences/residence-ui";

const cardSizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export function ResidenceCard({ residence: r }: { residence: Residence }) {
  const href = `/residences/${r.slug}`;
  const cover = coverImage(r);
  // Validated at build time, so these always resolve.
  const listedBy = getCompany(r.listedBy)!;
  const developer = r.developer && r.developer !== r.listedBy ? getCompany(r.developer) : undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      {/* Fixed 4:5 so card heights never depend on what a company uploaded. The
          image repeats the title link, so it's skipped by keyboard and screen readers. */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/5] overflow-hidden bg-navy-deep">
        {cover ? (
          <Image src={cover} alt="" fill sizes={cardSizes} className="object-cover" />
        ) : (
          <MediaPlaceholder />
        )}
        <StatusBadge status={r.status} className="absolute left-4 top-4" />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* Eyebrow styling in muted grey: the gold eyebrow is ~3:1 on white. */}
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {r.area} · {r.propertyType}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-snug text-navy">
          <Link href={href} title={r.name} className="line-clamp-2 underline-offset-4 hover:underline">
            {r.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{formatSpecs(r)}</p>

        {/* Whole rows are the links, so each target is 44px tall; names truncate to one line. */}
        <div className="mt-3 text-sm">
          <Link
            href={`/developers/${listedBy.slug}`}
            title={`Listed by ${listedBy.name}`}
            className="group flex min-h-11 min-w-0 items-center gap-3"
          >
            <CompanyLogo company={listedBy} />
            <span className="min-w-0 truncate">
              <span className="text-muted-foreground">Listed by </span>
              <span className="font-medium text-charcoal underline-offset-4 group-hover:text-gold group-hover:underline">
                {listedBy.name}
              </span>
            </span>
          </Link>
          {developer && (
            <Link
              href={`/developers/${developer.slug}`}
              title={`Developed by ${developer.name}`}
              className="group flex min-h-11 min-w-0 items-center pl-13 text-muted-foreground"
            >
              <span className="min-w-0 truncate">
                Developed by{" "}
                <span className="underline-offset-4 group-hover:text-gold group-hover:underline">{developer.name}</span>
              </span>
            </Link>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="font-display text-lg font-semibold text-navy">{formatKes(r.priceKes)}</p>
            <Link
              href={enquireHref(r)}
              aria-label={`Enquire about ${r.name}`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-navy underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              Enquire
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Same box as a card with no developer line, so swapping it in doesn't shift layout. */
export function ResidenceCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-border bg-white">
      <div className="aspect-[4/5] bg-stone" />
      <div className="flex flex-1 flex-col p-5">
        <div className="h-4 w-1/3 rounded bg-stone" />
        <div className="mt-3 h-7 w-3/4 rounded bg-stone" />
        <div className="mt-2 h-4 w-1/2 rounded bg-stone" />
        <div className="mt-3 flex min-h-11 items-center gap-3">
          <div className="size-10 rounded-md bg-stone" />
          <div className="h-4 w-1/2 rounded bg-stone" />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className="h-6 w-2/5 rounded bg-stone" />
          <div className="h-11 w-16 rounded bg-stone" />
        </div>
      </div>
    </div>
  );
}

export function ResidenceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ResidenceCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Route-level loading state: a navy hero band and a grid of card-sized skeletons. */
export function ListingsPageSkeleton() {
  return (
    <main className="flex-1" aria-busy="true">
      <div className="gradient-navy h-[26rem] sm:h-[30rem]" />
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-stone" />
        <div className="mt-10">
          <ResidenceGridSkeleton />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
