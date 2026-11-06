"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/companies";
import {
  BED_OPTIONS,
  DEFAULT_QUERY,
  PRICE_BANDS,
  PROPERTY_TYPES,
  RESIDENCE_AREAS,
  RESIDENCE_STATUSES,
  SORTS,
  activeFilters,
  companyOptions,
  mostRestrictiveFilter,
  parseResidenceQuery,
  queryResidences,
  residenceCountLabel,
  residenceQueryString,
  type Residence,
  type ResidenceQuery,
} from "@/lib/residences";
import { ResidenceCard } from "@/components/residences/residence-card";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const fieldLabel = "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground";
const control =
  "h-11 w-full min-w-0 rounded-md border border-border bg-white px-3 text-sm text-charcoal transition-colors hover:border-navy/40 focus-visible:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

function SelectField<T extends string | number>({
  label,
  value,
  anyLabel,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  /** The "no filter" option; omitted for sort, which always has a value. */
  anyLabel?: string;
  options: readonly { value: T; label: string }[];
  onChange: (value: T | null) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <select
        id={id}
        className={control}
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange(options.find((o) => String(o.value) === e.target.value)?.value ?? null)}
      >
        {anyLabel && <option value="">{anyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Searchable company picker: a native text input + <datalist>, so typing
 * narrows the list with no extra library and it stays keyboard/AT friendly.
 * Only commits when the text exactly matches a company (or is cleared).
 */
function CompanyField({
  options,
  value,
  onChange,
}: {
  options: Company[];
  value: string | null;
  onChange: (slug: string | null) => void;
}) {
  const id = useId();
  const selectedName = options.find((c) => c.slug === value)?.name ?? "";
  const [text, setText] = useState(selectedName);
  // Follow outside changes (a chip removed, "Clear all") without an effect.
  const [synced, setSynced] = useState(selectedName);
  if (synced !== selectedName) {
    setSynced(selectedName);
    setText(selectedName);
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabel}>
        Company
      </label>
      <input
        id={id}
        type="search"
        list={`${id}-options`}
        autoComplete="off"
        placeholder="Any company"
        className={cn(control, "placeholder:text-charcoal")}
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          if (!next.trim()) return onChange(null);
          const match = options.find((c) => c.name.toLowerCase() === next.trim().toLowerCase());
          if (match) onChange(match.slug);
        }}
        onBlur={() => setText(selectedName)}
      />
      <datalist id={`${id}-options`}>
        {options.map((c) => (
          <option key={c.slug} value={c.name} />
        ))}
      </datalist>
    </div>
  );
}

function FilterFields({
  query,
  items,
  scoped,
  set,
}: {
  query: ResidenceQuery;
  items: Residence[];
  scoped: boolean;
  set: (patch: Partial<ResidenceQuery>) => void;
}) {
  return (
    <>
      <SelectField
        label="Neighbourhood"
        anyLabel="All neighbourhoods"
        value={query.area}
        options={RESIDENCE_AREAS.map((a) => ({ value: a, label: a }))}
        onChange={(area) => set({ area })}
      />
      {!scoped && (
        <CompanyField
          options={companyOptions(items, query)}
          value={query.company}
          onChange={(company) => set({ company })}
        />
      )}
      <SelectField
        label="Type"
        anyLabel="Any type"
        value={query.type}
        options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
        onChange={(type) => set({ type })}
      />
      <SelectField
        label="Bedrooms"
        anyLabel="Any"
        value={query.beds}
        options={BED_OPTIONS.map((n) => ({ value: n, label: `${n}+` }))}
        onChange={(beds) => set({ beds })}
      />
      <SelectField
        label="Price"
        anyLabel="Any price"
        value={query.price}
        options={PRICE_BANDS}
        onChange={(price) => set({ price })}
      />
      <SelectField
        label="Status"
        anyLabel="Any status"
        value={query.status}
        options={RESIDENCE_STATUSES.map((s) => ({ value: s, label: s }))}
        onChange={(status) => set({ status })}
      />
    </>
  );
}

const pill =
  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors";

/**
 * The /residences grid with its filters, sort and "Load more". All state lives
 * in the URL (read with useSearchParams, written with replaceState), so a
 * shared link or the Back button restores the exact view.
 */
export function ResidenceBrowser({
  items,
  heading,
  scoped = false,
}: {
  items: Residence[];
  heading: string;
  /** Already limited to one company (its profile page): hides the company filter. */
  scoped?: boolean;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const parsed = parseResidenceQuery(Object.fromEntries(searchParams));
  const query = scoped ? { ...parsed, company: null } : parsed;
  const tab = searchParams.get("tab");

  const { total, shown, hasMore } = queryResidences(items, query);
  const filters = activeFilters(query);

  // replaceState integrates with the Next router (useSearchParams updates)
  // without a server round-trip, and filter clicks don't pile up in history.
  const update = (next: ResidenceQuery) =>
    window.history.replaceState(null, "", `${pathname}${residenceQueryString(next, tab ? { tab } : {})}`);
  const set = (patch: Partial<ResidenceQuery>) => update({ ...query, ...patch, page: 1 });
  const clearAll = () => update({ ...DEFAULT_QUERY, sort: query.sort });

  // After "Load more", move focus to the first newly shown card.
  const gridRef = useRef<HTMLDivElement>(null);
  const focusIndex = useRef<number | null>(null);
  useEffect(() => {
    if (focusIndex.current === null) return;
    gridRef.current?.querySelectorAll<HTMLAnchorElement>("h3 a")[focusIndex.current]?.focus();
    focusIndex.current = null;
  }, [shown.length]);

  const restrictive = total === 0 ? mostRestrictiveFilter(items, query) : null;
  const restrictiveLabel = filters.find((f) => f.key === restrictive)?.label;

  const sortField = (
    <SelectField
      label="Sort by"
      value={query.sort}
      options={SORTS}
      onChange={(sort) => update({ ...query, sort: sort ?? "newest", page: 1 })}
    />
  );

  return (
    <section id="listings" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="font-display text-3xl font-light text-navy sm:text-4xl">{heading}</h2>
        <p aria-live="polite" className="mt-3 text-sm text-muted-foreground">
          {residenceCountLabel(total)}
          {hasMore && ` · showing ${shown.length}`}
        </p>

        {/* Mobile: one button opening a full-height sheet. */}
        <div className="mt-6 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" className={cn(pill, "border-navy text-navy hover:bg-navy hover:text-white")}>
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
                {filters.length > 0 && (
                  <span className="flex size-6 items-center justify-center rounded-full bg-gold text-xs text-navy">
                    <span className="sr-only">(</span>
                    {filters.length}
                    <span className="sr-only"> active)</span>
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" aria-describedby={undefined} className="gap-0 bg-white p-0 data-[side=bottom]:h-dvh">
              <div className="border-b border-border px-5 py-4">
                <SheetTitle className="font-display text-2xl font-light text-navy">Filters</SheetTitle>
              </div>
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
                <FilterFields query={query} items={items} scoped={scoped} set={set} />
                {sortField}
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4">
                <button type="button" onClick={clearAll} className={cn(pill, "justify-center border-border text-charcoal")}>
                  Clear all
                </button>
                <SheetClose asChild>
                  <button type="button" className={cn(pill, "justify-center border-navy bg-navy text-white hover:bg-navy-soft")}>
                    Show {total} {total === 1 ? "result" : "results"}
                  </button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: one bar that sticks under the 80px header. */}
        <div className="sticky top-20 z-30 -mx-8 mt-8 hidden border-b border-border bg-white/95 px-8 py-4 backdrop-blur lg:block">
          <div className={cn("grid items-end gap-3", scoped ? "grid-cols-6" : "grid-cols-7")}>
            <FilterFields query={query} items={items} scoped={scoped} set={set} />
            {sortField}
          </div>
        </div>

        {filters.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ul className="contents" aria-label="Active filters">
              {filters.map((f) => (
                <li key={f.key}>
                  <button
                    type="button"
                    onClick={() => set({ [f.key]: null })}
                    aria-label={`Remove filter: ${f.label}`}
                    className={cn(pill, "border-navy/20 bg-stone text-navy hover:border-navy")}
                  >
                    {f.label}
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={clearAll}
              className="min-h-11 px-3 text-sm font-medium text-navy underline underline-offset-4 hover:text-gold"
            >
              Clear all
            </button>
          </div>
        )}

        {total > 0 ? (
          <>
            <div ref={gridRef} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((r) => (
                <ResidenceCard key={r.slug} residence={r} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    focusIndex.current = shown.length;
                    update({ ...query, page: query.page + 1 });
                  }}
                  className={cn(pill, "border-navy px-8 text-navy hover:bg-navy hover:text-white")}
                >
                  Load more
                </button>
                <p className="text-xs text-muted-foreground">
                  Showing {shown.length} of {total}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">
              {filters.length
                ? `No residences match ${filters.map((f) => f.label).join(", ")}.`
                : "No residences listed right now."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {restrictive && (
                <button
                  type="button"
                  onClick={() => set({ [restrictive]: null })}
                  className={cn(pill, "border-navy bg-navy text-white hover:bg-navy-soft")}
                >
                  Remove “{restrictiveLabel}”
                </button>
              )}
              {filters.length > 0 && (
                <button type="button" onClick={clearAll} className={cn(pill, "border-navy text-navy hover:bg-navy hover:text-white")}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
