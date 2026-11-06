/**
 * Luxury residences for sale in Nairobi (`/residences`), listed by several
 * developers and agencies (see ./companies.ts).
 *
 * SAMPLE DATA: the listings and prices below are placeholders for the page
 * template, not real stock. The shape mirrors a future DB/CMS row (flat, typed,
 * keyed by `slug`); components only use the getters, so the arrays can become
 * queries later without touching them.
 *
 * Kept free of `@/` imports so `residences.check.ts` can run under plain Node.
 */
import { getCompanies, getCompany, type Company } from "./companies.ts";

export type ResidenceStatus = "For sale" | "New listing" | "Under offer" | "Sold";
export const RESIDENCE_STATUSES: ResidenceStatus[] = ["For sale", "New listing", "Under offer", "Sold"];

export type PropertyType = "House" | "Villa" | "Townhouse" | "Apartment" | "Penthouse" | "BnB";
export const PROPERTY_TYPES: PropertyType[] = ["House", "Villa", "Townhouse", "Apartment", "Penthouse", "BnB"];

export const RESIDENCE_AREAS = [
  "Karen",
  "Runda",
  "Muthaiga",
  "Lavington",
  "Kilimani",
  "Westlands",
] as const;

export type ResidenceArea = (typeof RESIDENCE_AREAS)[number];

export interface Residence {
  slug: string;
  name: string;
  area: ResidenceArea;
  bedrooms: number;
  bathrooms: number;
  /** e.g. "1.5 acres", "420 m²", "gated community" */
  sizeLabel: string;
  /** Whole shillings. */
  priceKes: number;
  status: ResidenceStatus;
  /** TikTok or Instagram URL; empty = placeholder. */
  videoUrl?: string;
  /** Optional still; empty = placeholder. Superseded by `images` when both exist. */
  imageUrl?: string;
  /** Company slug — who is selling/listing it. */
  listedBy: string;
  /** Company slug — who built it. May equal `listedBy`. */
  developer?: string;
  propertyType: PropertyType;
  images?: string[];
  description?: string;
  /** ISO date, e.g. "2026-09-14". */
  dateListed: string;
}

export interface VideoTour {
  title: string;
  platform: "tiktok" | "instagram";
  url?: string;
}

const residences: Residence[] = [
  {
    slug: "acacia-house", name: "Acacia House", area: "Karen", propertyType: "House",
    bedrooms: 5, bathrooms: 6, sizeLabel: "1.5 acres", priceKes: 185_000_000, status: "For sale",
    listedBy: "mvule-and-hart-realty", developer: "kijani-ridge-developments", dateListed: "2026-08-02",
    description:
      "A single-storey stone house set back from the road behind mature acacias, with a covered veranda running the length of the garden side, a separate guest cottage and staff quarters.",
  },
  {
    slug: "ridgeway-residence", name: "The Ridgeway Residence", area: "Runda", propertyType: "House",
    bedrooms: 6, bathrooms: 7, sizeLabel: "1 acre", priceKes: 240_000_000, status: "For sale",
    listedBy: "mvule-and-hart-realty", dateListed: "2026-06-18",
  },
  {
    slug: "muthaiga-garden-estate", name: "Muthaiga Garden Estate", area: "Muthaiga", propertyType: "House",
    bedrooms: 7, bathrooms: 8, sizeLabel: "2 acres", priceKes: 320_000_000, status: "For sale",
    listedBy: "mvule-and-hart-realty", developer: "kijani-ridge-developments", dateListed: "2026-07-21",
    description:
      "A two-storey family home on two landscaped acres, with formal reception rooms, a library, a heated pool and a walled kitchen garden.",
  },
  {
    slug: "jacaranda-townhouse", name: "Jacaranda Townhouse", area: "Lavington", propertyType: "Townhouse",
    bedrooms: 4, bathrooms: 5, sizeLabel: "gated community", priceKes: 95_000_000, status: "For sale",
    listedBy: "savanna-crest-homes", developer: "savanna-crest-homes", dateListed: "2026-09-05",
  },
  {
    slug: "argwings-penthouse", name: "Argwings Penthouse", area: "Kilimani", propertyType: "Penthouse",
    bedrooms: 4, bathrooms: 4, sizeLabel: "420 m²", priceKes: 68_000_000, status: "For sale",
    listedBy: "savanna-crest-homes", developer: "savanna-crest-homes", dateListed: "2026-08-27",
    description:
      "A full-floor penthouse with a wraparound terrace, private lift lobby and open views across the city towards the Ngong Hills.",
  },
  {
    slug: "riverside-sky-apartment", name: "Riverside Sky Apartment", area: "Westlands", propertyType: "Apartment",
    bedrooms: 3, bathrooms: 3, sizeLabel: "260 m²", priceKes: 42_000_000, status: "New listing",
    listedBy: "savanna-crest-homes", developer: "savanna-crest-homes", dateListed: "2026-10-12",
  },
  {
    slug: "ngong-view-villa", name: "Ngong View Villa", area: "Karen", propertyType: "Villa",
    bedrooms: 6, bathrooms: 7, sizeLabel: "2.5 acres", priceKes: 210_000_000, status: "New listing",
    listedBy: "mvule-and-hart-realty", dateListed: "2026-10-03",
  },
  {
    slug: "runda-grove-house", name: "Runda Grove House", area: "Runda", propertyType: "House",
    bedrooms: 5, bathrooms: 6, sizeLabel: "0.75 acres", priceKes: 165_000_000, status: "For sale",
    listedBy: "savanna-crest-homes", dateListed: "2026-07-09",
  },
  {
    slug: "lavington-courtyard-home", name: "Lavington Courtyard Home", area: "Lavington", propertyType: "House",
    bedrooms: 5, bathrooms: 5, sizeLabel: "0.5 acres", priceKes: 120_000_000, status: "Under offer",
    listedBy: "mvule-and-hart-realty", dateListed: "2026-05-30",
  },
];

/** Featured tours for the "On film" section: the Luxury Creations sample on their profile. */
export const filmCompany = getCompany("luxury-creations")!;
export const videoTours: VideoTour[] = (filmCompany.videos ?? []).map((url, i) => ({
  title: `${filmCompany.name}: tour ${i + 1}`,
  platform: url.includes("tiktok.com") ? "tiktok" : "instagram",
  url,
}));

/* -------------------------------------------------------------------------- */
/* Validation — runs when this module loads, so a bad slug fails `next build`  */
/* -------------------------------------------------------------------------- */

/** Throws one error listing every broken reference. */
export function validateListings(items: Residence[], companyList: Company[]): void {
  const known = new Set(companyList.map((c) => c.slug));
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of items) {
    if (seen.has(r.slug)) errors.push(`Residence "${r.slug}": duplicate slug`);
    seen.add(r.slug);
    if (!known.has(r.listedBy)) errors.push(`Residence "${r.slug}": listedBy "${r.listedBy}" is not a known company`);
    if (r.developer && !known.has(r.developer)) {
      errors.push(`Residence "${r.slug}": developer "${r.developer}" is not a known company`);
    }
    if (Number.isNaN(Date.parse(r.dateListed))) errors.push(`Residence "${r.slug}": dateListed "${r.dateListed}" is not an ISO date`);
  }
  for (const c of companyList) {
    if (c.shortDescription.length > 160) errors.push(`Company "${c.slug}": shortDescription is over 160 characters`);
  }
  if (errors.length) throw new Error(`Invalid residence data:\n  ${errors.join("\n  ")}`);
}

validateListings(residences, getCompanies());

/* -------------------------------------------------------------------------- */
/* Getters — the only way components read the data                            */
/* -------------------------------------------------------------------------- */

export function getResidences(): Residence[] {
  return residences;
}

export function getResidence(slug: string): Residence | undefined {
  return residences.find((r) => r.slug === slug);
}

/** Every company slug a residence involves (listing company + developer). */
export function involves(r: Residence, companySlug: string): boolean {
  return r.listedBy === companySlug || r.developer === companySlug;
}

/** Residences a company listed / developed, and the count of unsold ones it's involved in. */
export function residencesForCompany(companySlug: string, items: Residence[] = residences) {
  return {
    listed: items.filter((r) => r.listedBy === companySlug),
    developed: items.filter((r) => r.developer === companySlug),
    active: items.filter((r) => involves(r, companySlug) && r.status !== "Sold").length,
  };
}

/** The contact form pre-fills from these and records the lead's source as `asset:<slug>`. */
export function enquireHref(r: Residence): string {
  const params = new URLSearchParams({ asset: r.slug, title: r.name, category: "Residence", listedBy: r.listedBy });
  return `/contact?${params.toString()}`;
}

export function coverImage(r: Residence): string | undefined {
  return r.images?.[0] ?? r.imageUrl;
}

/* -------------------------------------------------------------------------- */
/* Formatting — the one place prices and specs are turned into text           */
/* -------------------------------------------------------------------------- */

const kesFormatter = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/** "KES 185,000,000" */
export function formatKes(amount: number): string {
  return `KES ${kesFormatter.format(amount)}`;
}

/** "5 bed · 6 bath · 1.5 acres" */
export function formatSpecs(r: Pick<Residence, "bedrooms" | "bathrooms" | "sizeLabel">): string {
  return `${r.bedrooms} bed · ${r.bathrooms} bath · ${r.sizeLabel}`;
}

/** "14 September 2026" */
export function formatListedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/* -------------------------------------------------------------------------- */
/* Filter / sort / paginate — shared by the server render and the controls     */
/* -------------------------------------------------------------------------- */

export const PAGE_SIZE = 12;
export const BED_OPTIONS = [1, 2, 3, 4, 5] as const;

export const PRICE_BANDS = [
  { value: "under-50m", label: "Under KES 50M", min: 0, max: 50_000_000 },
  { value: "50-100m", label: "KES 50M to 100M", min: 50_000_000, max: 100_000_000 },
  { value: "100-200m", label: "KES 100M to 200M", min: 100_000_000, max: 200_000_000 },
  { value: "200m-plus", label: "KES 200M+", min: 200_000_000, max: Infinity },
] as const;
export type PriceBand = (typeof PRICE_BANDS)[number]["value"];

export const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
] as const;
export type ResidenceSort = (typeof SORTS)[number]["value"];

export interface ResidenceQuery {
  area: ResidenceArea | null;
  /** Company slug — matches the listing company or the developer. */
  company: string | null;
  type: PropertyType | null;
  /** Minimum bedrooms. */
  beds: number | null;
  price: PriceBand | null;
  status: ResidenceStatus | null;
  sort: ResidenceSort;
  /** 1-based; page N shows the first N × PAGE_SIZE results. */
  page: number;
}

export type FilterKey = "area" | "company" | "type" | "beds" | "price" | "status";
export const FILTER_KEYS: FilterKey[] = ["area", "company", "type", "beds", "price", "status"];

export const DEFAULT_QUERY: ResidenceQuery = {
  area: null, company: null, type: null, beds: null, price: null, status: null, sort: "newest", page: 1,
};

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

type Params = Record<string, string | string[] | undefined>;

/** Parse `?area=karen&beds=4&sort=price-asc`. Unknown values fall back to the defaults. */
export function parseResidenceQuery(params: Params): ResidenceQuery {
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.toLowerCase();
  const pick = <T extends string>(list: readonly T[], v?: string | string[]) =>
    list.find((x) => slugify(x) === first(v)) ?? null;

  const company = first(params.company);
  const beds = Number(first(params.beds));
  const page = Number(first(params.page));
  const sortParam = first(params.sort);
  // `high` / `low` are the pre-multi-company values; keep old links working.
  const legacy: Record<string, ResidenceSort> = { high: "price-desc", low: "price-asc" };

  return {
    area: pick(RESIDENCE_AREAS, params.area),
    company: company && getCompany(company) ? company : null,
    type: pick(PROPERTY_TYPES, params.type),
    beds: (BED_OPTIONS as readonly number[]).includes(beds) ? beds : null,
    price: pick(PRICE_BANDS.map((b) => b.value), params.price),
    status: pick(RESIDENCE_STATUSES, params.status),
    sort: pick(SORTS.map((s) => s.value), sortParam) ?? (sortParam ? legacy[sortParam] : undefined) ?? "newest",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** The query string for a state, omitting defaults ("" when nothing is set). */
export function residenceQueryString(q: ResidenceQuery, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams(extra);
  if (q.area) params.set("area", slugify(q.area));
  if (q.company) params.set("company", q.company);
  if (q.type) params.set("type", slugify(q.type));
  if (q.beds) params.set("beds", String(q.beds));
  if (q.price) params.set("price", q.price);
  if (q.status) params.set("status", slugify(q.status));
  if (q.sort !== "newest") params.set("sort", q.sort);
  if (q.page > 1) params.set("page", String(q.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** `/residences?area=karen` — the breadcrumb target for a neighbourhood. */
export function areaHref(area: ResidenceArea): string {
  return `/residences${residenceQueryString({ ...DEFAULT_QUERY, area })}`;
}

export function filterResidences(items: Residence[], q: ResidenceQuery): Residence[] {
  const band = PRICE_BANDS.find((b) => b.value === q.price);
  return items.filter(
    (r) =>
      (!q.area || r.area === q.area) &&
      (!q.company || involves(r, q.company)) &&
      (!q.type || r.propertyType === q.type) &&
      (!q.beds || r.bedrooms >= q.beds) &&
      (!band || (r.priceKes >= band.min && r.priceKes < band.max)) &&
      (!q.status || r.status === q.status),
  );
}

/** New array; ties break on slug so the order is stable between renders. */
export function sortResidences(items: Residence[], sort: ResidenceSort): Residence[] {
  const bySlug = (a: Residence, b: Residence) => a.slug.localeCompare(b.slug);
  return [...items].sort((a, b) => {
    const diff =
      sort === "price-desc" ? b.priceKes - a.priceKes
      : sort === "price-asc" ? a.priceKes - b.priceKes
      : b.dateListed.localeCompare(a.dateListed);
    return diff || bySlug(a, b);
  });
}

/** Everything the grid needs for one query. */
export function queryResidences(items: Residence[], q: ResidenceQuery) {
  const results = sortResidences(filterResidences(items, q), q.sort);
  const shown = results.slice(0, q.page * PAGE_SIZE);
  return { total: results.length, shown, hasMore: shown.length < results.length };
}

/** The active filters, in display order, for the removable chips. */
export function activeFilters(q: ResidenceQuery): { key: FilterKey; label: string }[] {
  const label: Record<FilterKey, () => string> = {
    area: () => q.area!,
    company: () => getCompany(q.company!)?.name ?? q.company!,
    type: () => q.type!,
    beds: () => `${q.beds}+ beds`,
    price: () => PRICE_BANDS.find((b) => b.value === q.price)!.label,
    status: () => q.status!,
  };
  return FILTER_KEYS.filter((k) => q[k] !== null).map((key) => ({ key, label: label[key]() }));
}

/** The filter whose removal brings back the most results (null if none are set). */
export function mostRestrictiveFilter(items: Residence[], q: ResidenceQuery): FilterKey | null {
  let best: FilterKey | null = null;
  let bestCount = -1;
  for (const { key } of activeFilters(q)) {
    const count = filterResidences(items, { ...q, [key]: null }).length;
    if (count > bestCount) [best, bestCount] = [key, count];
  }
  return best;
}

/** Companies with at least one result under the other filters, A–Z (plus the selected one). */
export function companyOptions(items: Residence[], q: ResidenceQuery): Company[] {
  return getCompanies()
    .filter((c) => c.slug === q.company || filterResidences(items, { ...q, company: c.slug }).length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** "9 residences" / "1 residence". */
export function residenceCountLabel(count: number): string {
  return `${count} ${count === 1 ? "residence" : "residences"}`;
}
