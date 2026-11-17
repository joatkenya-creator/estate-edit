/**
 * Residences in Nairobi (`/residences`), for sale or to rent, listed by several
 * developers and agencies (see ./companies.ts) or directly by The Estate Edit.
 *
 * The shape mirrors a future DB/CMS row (flat, typed,
 * keyed by `slug`); components only use the getters, so the arrays can become
 * queries later without touching them.
 *
 * Kept free of `@/` imports so `residences.check.ts` can run under plain Node.
 */
import { getCompanies, getCompany, type Company } from "./companies.ts";

export type ResidenceStatus = "For sale" | "For rent" | "New listing" | "Under offer" | "Sold";
export const RESIDENCE_STATUSES: ResidenceStatus[] = ["For sale", "For rent", "New listing", "Under offer", "Sold"];

export type PropertyType = "House" | "Villa" | "Townhouse" | "Apartment" | "Penthouse" | "BnB";
export const PROPERTY_TYPES: PropertyType[] = ["House", "Villa", "Townhouse", "Apartment", "Penthouse", "BnB"];

export const RESIDENCE_AREAS = [
  "Karen",
  "Runda",
  "Muthaiga",
  "Lavington",
  "Kilimani",
  "Westlands",
  "Kiambu Road",
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
  /** Floor area for structured data, when known. */
  floorAreaSqft?: number;
  /** Whole shillings; per month when `status` is "For rent". */
  priceKes: number;
  status: ResidenceStatus;
  /** TikTok or Instagram URL; empty = placeholder. */
  videoUrl?: string;
  /** Optional still; empty = placeholder. Superseded by `images` when both exist. */
  imageUrl?: string;
  /** Company slug — who is selling/listing it. Absent = listed directly by The Estate Edit. */
  listedBy?: string;
  /** Company slug — who built it. May equal `listedBy`. */
  developer?: string;
  propertyType: PropertyType;
  /** First image is the cover. */
  images?: { url: string; alt: string }[];
  description?: string;
  /** ISO date, e.g. "2026-09-14". */
  dateListed: string;
  /** The one residence spotlighted on /residences (and /expat-services). */
  featured?: boolean;
  furnished?: boolean;
  /** Rentals: lease terms shown in the key facts. */
  lease?: { term: string; includes: string[]; powerBackup?: string };
  /** Overrides for the generated <title> (before the site suffix) and meta description. */
  seo?: { title: string; description: string };
  /** Detail-page copy: a headline and intro for the hero, then free sections. */
  headline?: string;
  intro?: string;
  sections?: { title: string; body?: string; items?: { label?: string; text: string }[] }[];
  goodFor?: string[];
  /** Hero only: a word shown after the price, e.g. "only" -> "KES 100,000 only / month". */
  priceQualifier?: string;
  /** Hero only: replaces the grey listing-name line under the intro. */
  valueLine?: { lead: string; text: string; note?: string };
  /** Hero only: "Included in the rent" chips above the CTAs. */
  includedHighlights?: string[];
}

export interface VideoTour {
  title: string;
  platform: "tiktok" | "instagram";
  url?: string;
}

const FJ = "/residences/fourways-junction";

// Kings units go here once Kings shares unit-level availability (brief 7.5).
const residences: Residence[] = [
  {
    slug: "fourways-junction-2-bedroom-kiambu-road",
    name: "Elegantly Furnished 2-Bedroom Apartment, Fourways Junction, Kiambu Road",
    area: "Kiambu Road",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    sizeLabel: "860 sq ft (approx. 80 m²)",
    floorAreaSqft: 860,
    priceKes: 100_000,
    status: "For rent",
    furnished: true,
    featured: true,
    dateListed: "2026-11-17",
    lease: {
      term: "12-month lease",
      includes: ["90 Mbps fibre internet", "Service charge (HOA)", "Water"],
      powerBackup: "Covers lights and internet",
    },
    seo: {
      title: "Furnished 2-Bedroom Apartment for Rent, Kiambu Road (Fourways Junction)",
      description:
        "Fully furnished 2-bed, 2-bath near UN Gigiri & top international schools. KSh 100,000/month incl. fibre, water & service charge. Veteran-owned.",
    },
    headline: "A furnished two-bedroom made for the expat year in Nairobi",
    intro:
      "A calm, fully furnished two-bedroom in Fourways Junction, a secure gated estate off Kiambu Road. Bring a suitcase and move in: fibre internet, water and service charge are already in the rent, and backup power keeps the lights and Wi-Fi on.",
    sections: [
      {
        title: "Honest rent, owned by a veteran",
        body: "This home belongs to a US military veteran who has lived overseas and knows what it is like to arrive somewhere new and be quoted the “foreigner price”. Rent is a flat KES 100,000 a month for a 12-month lease, with internet, water and service charge included. No surprise add-ons, no expat markup.",
      },
      {
        title: "Inside the apartment",
        items: [
          { label: "Living room", text: "Generous seating, a smart flat-screen TV and two walls of windows" },
          { label: "Dining area", text: "A table for four, close to the kitchen" },
          { label: "Kitchen", text: "Fridge, gas cooker with oven, microwave, coffee maker and a full set of cookware and glassware" },
          { label: "Master suite", text: "Ensuite bathroom, queen bed and full-height built-in wardrobes" },
          { label: "Second bedroom", text: "Twin beds, good for children, a guest or a housemate" },
          { text: "Two bathrooms, a utility area with a washing machine, and a private balcony overlooking the estate" },
        ],
      },
      {
        title: "Everything close by",
        items: [
          { label: "Diplomatic & work", text: "UN Complex Gigiri, with quick routes to Westlands and the CBD" },
          { label: "International schools", text: "Braeburn Garden Estate, SABIS International, Brookhouse Runda, Potterhouse School" },
          { label: "Shopping & leisure", text: "Ridgeways Mall, Two Rivers Mall, Village Market, Windsor Golf & Country Club, Muthaiga Golf Club, Karura Forest" },
          { label: "Health", text: "AAR Hospital nearby" },
          { label: "Security", text: "Gated estate with 24/7 security" },
        ],
      },
    ],
    goodFor: ["Diplomats & UN staff", "Expat families", "Corporate relocations", "NGO professionals"],
    priceQualifier: "only",
    valueLine: {
      lead: "All of this for only KES 100,000 a month:",
      text: "fully furnished 2 bed, 2 bath · 90 Mbps fibre · water · service charge · backup power · 24/7 gated security.",
      note: "No agent games, no expat markup.",
    },
    includedHighlights: ["Fully furnished", "90 Mbps fibre", "Water", "Service charge", "Backup power", "24/7 security"],
    images: [
      { url: `${FJ}/living-room.webp`, alt: "Furnished living room with sofas, coffee tables, a smart flat-screen TV on a wall unit and two large windows" },
      { url: `${FJ}/living-dining.webp`, alt: "Living area with a dining table and chairs by the front door, sofas and an armchair around a rug" },
      { url: `${FJ}/living-room-2.webp`, alt: "Living room seen from the dining table: armchair, sofas, TV unit and full-height windows with the balcony door" },
      { url: `${FJ}/living-room-3.webp`, alt: "Living room sofas and coffee tables under two curtained windows" },
      { url: `${FJ}/kitchen.webp`, alt: "Tiled kitchen with fitted cabinets, gas cooker with oven, microwave, coffee maker and a window over the sink" },
      { url: `${FJ}/kitchen-cupboard.webp`, alt: "Open kitchen cupboard stocked with glasses, a jug, a cafetière and mugs, with the coffee maker below" },
      { url: `${FJ}/master-bedroom.webp`, alt: "Master bedroom with a queen bed, bedside lamp and a large curtained window" },
      { url: `${FJ}/master-bedroom-wardrobes.webp`, alt: "Master bedroom seen from the door, with full-height built-in wardrobes along one wall" },
      { url: `${FJ}/master-bedroom-2.webp`, alt: "Queen bed in the master bedroom with a laundry basket by the window" },
      { url: `${FJ}/twin-bedroom.webp`, alt: "Second bedroom with two single beds, a shared bedside table and lamp, and a rug" },
      { url: `${FJ}/twin-bedroom-2.webp`, alt: "Twin bedroom made up with fresh linen under a wide window" },
      { url: `${FJ}/bathroom-1.webp`, alt: "Bathroom with a shower, toilet and basin, lit by a window" },
      { url: `${FJ}/bathroom-2.webp`, alt: "Second bathroom with a tiled shower, mosaic feature strip, toilet and basin" },
      { url: `${FJ}/laundry.webp`, alt: "Utility area with a top-loading washing machine beside a window" },
      { url: `${FJ}/hallway.webp`, alt: "Hallway with wooden floors leading to the bedrooms, with a wall mirror" },
    ],
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
    if (r.listedBy && !known.has(r.listedBy)) errors.push(`Residence "${r.slug}": listedBy "${r.listedBy}" is not a known company`);
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

export function getFeaturedResidence(): Residence | undefined {
  return residences.find((r) => r.featured);
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
  const params = new URLSearchParams({ asset: r.slug, title: r.name, category: r.status === "For rent" ? "Rental" : "Residence" });
  if (r.listedBy) params.set("listedBy", r.listedBy);
  return `/contact?${params.toString()}`;
}

export function coverImage(r: Residence): string | undefined {
  return r.images?.[0]?.url ?? r.imageUrl;
}

/** The card/hero tag: "For rent · Furnished", else the status. */
export function listingTag(r: Pick<Residence, "status" | "furnished">): string {
  return r.status === "For rent" && r.furnished ? "For rent · Furnished" : r.status;
}

/* -------------------------------------------------------------------------- */
/* Formatting — the one place prices and specs are turned into text           */
/* -------------------------------------------------------------------------- */

const kesFormatter = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/** "KES 185,000,000" */
export function formatKes(amount: number): string {
  return `KES ${kesFormatter.format(amount)}`;
}

/** "KES 185,000,000", or "KES 100,000 / month" for a rental. */
export function formatPrice(r: Pick<Residence, "priceKes" | "status">): string {
  return r.status === "For rent" ? `${formatKes(r.priceKes)} / month` : formatKes(r.priceKes);
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
