/**
 * New developments (`/developments`), each with its unit types and amenities.
 *
 * Every fact here comes from Kings' own materials (brochure + architect's
 * drawings), per brief section 2.3. Unknowns (prices, completion, availability)
 * stay null and render as "Price on request" / "Contact sales". Never fill them
 * in without Kings' written figures.
 *
 * Kept free of `@/` imports so `developments.check.ts` can run under plain Node.
 */
import { getCompanies } from "./companies.ts";

export type DevelopmentStatus = "off_plan" | "under_construction" | "ready" | "sold_out";

export const STATUS_LABEL: Record<DevelopmentStatus, string> = {
  off_plan: "Off-plan",
  under_construction: "Under construction",
  ready: "Ready",
  sold_out: "Sold out",
};

export interface Room {
  name: string;
  /** "3.6 × 5.1 m"; absent when the drawing gives no dimensions. */
  size?: string;
  /** Maisonettes only: which floor the room is on. */
  floor?: "Ground floor" | "First floor";
}

export interface UnitType {
  slug: string;
  /** Brochure name (brief 2.5 #5). */
  name: string;
  category: "apartment" | "maisonette";
  bedrooms: number;
  bathrooms: number;
  sizeSqft: number;
  unitCount: number;
  unitsAvailable: number | null;
  priceFromKes: number | null;
  hasBalcony: boolean;
  hasSq: boolean;
  hasGarden: boolean;
  rooms: Room[];
  features: string[];
}

export interface Development {
  slug: string;
  name: string;
  /** Company slug (./companies.ts) — who builds it. */
  developer: string;
  /** Unpublished drafts 404 and stay out of nav, sitemap and listings. */
  published: boolean;
  /** null until Kings confirms the construction stage (brief 12 #5). */
  status: DevelopmentStatus | null;
  locationName: string;
  address: string | null;
  tagline: string | null;
  shortDescription: string;
  totalUnits: number | null;
  priceFromKes: number | null;
  completionEstimate: string | null;
  paymentPlanSummary: string | null;
  disclaimer: string;
  unitTypes: UnitType[];
  amenities: string[];
  /** Short amenity highlights for the key-facts strip (brochure wording). */
  highlights: string[];
  /** Brochure location claims, grouped. Shown as Kings' claims, no drive times added. */
  nearby: { group: string; places: string[] }[];
}

/** Brief 2.3: the brochure disclaimer, shown on every Lotus page. */
const BROCHURE_DISCLAIMER =
  "Perspectives are an artist's impression. Plans may change without notice as directed by the architects or the authorities. Furniture shown is for illustration only.";

const developments: Development[] = [
  {
    slug: "kings-lotus",
    name: "Kings Lotus",
    developer: "kings-developers",
    // ponytail: stays unpublished in production until Kings answers brief 12 #1–#4
    // (location, affordable vs premium, 3BR size). The /developments route is
    // also gated by DEVELOPMENTS_LIVE in site.ts.
    published: true,
    status: null,
    // Brochure wording. Brief 2.5 #1: Karen vs Gataka Road is unresolved.
    locationName: "Gataka Road, Ongata Rongai",
    address: null,
    tagline: "Rise, Thrive, Flourish",
    shortDescription:
      "Mid-rise apartment blocks and a row of four-bedroom maisonettes with gardens, with a shopping complex, clubhouse and children's play area, along Gataka Road in Ongata Rongai.",
    totalUnits: 308,
    priceFromKes: null,
    completionEstimate: null,
    paymentPlanSummary: null,
    disclaimer: BROCHURE_DISCLAIMER,
    unitTypes: [
      {
        slug: "2-bedroom-standard",
        name: "2 Bedroom Standard",
        category: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        sizeSqft: 665,
        unitCount: 84,
        unitsAvailable: null,
        priceFromKes: null,
        hasBalcony: false,
        hasSq: false,
        hasGarden: false,
        // The drawing labels both bedrooms "Bedroom 01" (brief 2.5 #4); numbered here.
        rooms: [
          { name: "Lounge / dining", size: "3.6 × 5.1 m" },
          { name: "Bedroom 1", size: "3.2 × 3.7 m" },
          { name: "Bedroom 2", size: "2.4 × 3.2 m" },
          { name: "Bathroom", size: "1.2 × 2.3 m" },
          { name: "Kitchen", size: "2.4 × 2.4 m" },
          { name: "Yard", size: "1.1 × 2.9 m" },
        ],
        features: [],
      },
      {
        slug: "2-bedroom-master-ensuite",
        name: "2 Bedroom Master Ensuite",
        category: "apartment",
        bedrooms: 2,
        bathrooms: 2,
        sizeSqft: 740,
        unitCount: 84,
        unitsAvailable: null,
        priceFromKes: null,
        hasBalcony: false,
        hasSq: false,
        hasGarden: false,
        rooms: [
          { name: "Living / dining", size: "3.6 × 4.9 m" },
          { name: "Master bedroom", size: "3.0 × 4.2 m" },
          { name: "En-suite", size: "1.4 × 2.4 m" },
          { name: "Bedroom 2", size: "2.5 × 3.4 m" },
          { name: "Shared bathroom", size: "1.4 × 2.3 m" },
          { name: "Kitchen", size: "2.4 × 2.3 m" },
          { name: "Yard", size: "1.1 × 3.0 m" },
        ],
        features: ["Master en-suite"],
      },
      {
        slug: "3-bedroom-master-ensuite",
        name: "3 Bedroom Master Ensuite",
        category: "apartment",
        bedrooms: 3,
        bathrooms: 2,
        // Brochure figure. The drawing says 925 ft² (brief 2.5 #2): confirm with Kings.
        sizeSqft: 950,
        unitCount: 112,
        unitsAvailable: null,
        priceFromKes: null,
        // Brochure says "with balcony"; not clearly shown on the drawing (brief 2.5 #2).
        hasBalcony: true,
        hasSq: false,
        hasGarden: false,
        rooms: [
          { name: "Living / dining", size: "3.55 × 5.3 m" },
          { name: "Master bedroom", size: "3.4 × 4.2 m" },
          { name: "En-suite", size: "1.5 × 2.5 m" },
          { name: "Bedroom 2", size: "2.8 × 3.1 m" },
          { name: "Bedroom 3", size: "2.4 × 3.5 m" },
          { name: "Shared bathroom", size: "1.4 × 2.4 m" },
          { name: "Kitchen", size: "2.4 × 2.8 m" },
          { name: "Yard", size: "1.1 × 2.8 m" },
          { name: "Balcony" },
        ],
        features: ["Master en-suite", "Balcony"],
      },
      {
        slug: "4-bedroom-maisonette",
        name: "4 Bedroom Maisonette",
        category: "maisonette",
        bedrooms: 4,
        // Plus a bathroom in the DSQ (brief 2.5 #6).
        bathrooms: 3,
        sizeSqft: 1580,
        unitCount: 28,
        unitsAvailable: null,
        priceFromKes: null,
        hasBalcony: true,
        hasSq: true,
        hasGarden: true,
        rooms: [
          { floor: "Ground floor", name: "Foyer" },
          { floor: "Ground floor", name: "Living / dining", size: "4.5 × 5.1 m" },
          { floor: "Ground floor", name: "Kitchen", size: "2.8 × 2.7 m" },
          { floor: "Ground floor", name: "Kitchen yard", size: "2.7 × 2.9 m" },
          { floor: "Ground floor", name: "Bedroom", size: "2.7 × 3.4 m" },
          { floor: "Ground floor", name: "Bathroom" },
          { floor: "Ground floor", name: "DSQ with bathroom", size: "2.7 × 2.0 m" },
          { floor: "Ground floor", name: "Parking", size: "5.1 × 5.1 m" },
          { floor: "Ground floor", name: "Backyard garden", size: "4.0 × 8.0 m" },
          { floor: "First floor", name: "Master bedroom with en-suite", size: "4.4 × 4.1 m" },
          { floor: "First floor", name: "Bedroom", size: "3.6 × 3.4 m" },
          { floor: "First floor", name: "Bedroom", size: "3.6 × 3.1 m" },
          { floor: "First floor", name: "Bathroom" },
          { floor: "First floor", name: "Study" },
          { floor: "First floor", name: "Balcony", size: "1.2 × 3.0 m" },
        ],
        features: ["Servant quarters (DSQ)", "Private backyard garden", "Own parking", "Balcony", "Study"],
      },
    ],
    highlights: ["1 high-speed lift per block", "Borehole", "24/7 security and CCTV"],
    // Brochure amenities, exact list (brief 2.3).
    amenities: [
      "Landscaped gardens",
      "Ample and secure parking",
      "24/7 security and CCTV",
      "Children's play area and family spaces",
      "Community clubhouse",
      "Secured boundary wall",
      "Solar lights in all common areas",
      "Borehole",
      "Anti-termite foundation",
      "1 high-speed elevator per block",
      "Cabro-paved driveways",
      "Controlled access with security checkpoints",
      "Provision for TV points",
      "Provision for gas cylinders in the kitchen yard",
      "Shopping complex with retail shops",
    ],
    nearby: [
      { group: "Schools", places: ["Apex Boys High", "Thorn Tree", "Ongata Royal Academy", "Precious Gems"] },
      {
        group: "Universities",
        places: ["Multimedia University", "Cooperative University", "Adventist University of Africa", "Kenya School of Law"],
      },
      { group: "Shopping", places: ["The Hub Karen", "Karen Provision Centre (Hardy)", "Maasai Mall", "Maiyan Mall"] },
      { group: "Health", places: ["Mount Olive", "The Karen Hospital Rongai", "Avenue Rongai", "King David"] },
      { group: "Sport", places: ["Sinoni Sports Club", "Nakeel Stadium", "Karen Country Club", "Ngong Stadium"] },
    ],
  },
  {
    slug: "kings-apollo",
    name: "Kings Apollo",
    developer: "kings-developers",
    published: false,
    status: null,
    locationName: "Kileleshwa",
    address: null,
    tagline: null,
    shortDescription: "[KINGS TO CONFIRM]",
    totalUnits: null,
    priceFromKes: null,
    completionEstimate: null,
    paymentPlanSummary: null,
    disclaimer: BROCHURE_DISCLAIMER,
    unitTypes: [],
    amenities: [],
    highlights: [],
    nearby: [],
  },
  {
    // Marketing name unknown (brief 12 #2); slug is a placeholder.
    slug: "kings-ngong",
    name: "[KINGS TO CONFIRM] Ngong project",
    developer: "kings-developers",
    published: false,
    status: null,
    locationName: "Ngong",
    address: null,
    tagline: null,
    shortDescription: "[KINGS TO CONFIRM]",
    totalUnits: null,
    priceFromKes: null,
    completionEstimate: null,
    paymentPlanSummary: null,
    disclaimer: BROCHURE_DISCLAIMER,
    unitTypes: [],
    amenities: [],
    highlights: [],
    nearby: [],
  },
];

/* -------------------------------------------------------------------------- */
/* Validation — runs on load, so bad data fails `next build`                  */
/* -------------------------------------------------------------------------- */

export function validateDevelopments(items: Development[], companySlugs: string[]): void {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const d of items) {
    if (seen.has(d.slug)) errors.push(`Development "${d.slug}": duplicate slug`);
    seen.add(d.slug);
    if (!companySlugs.includes(d.developer)) errors.push(`Development "${d.slug}": unknown developer "${d.developer}"`);
    if (d.published && JSON.stringify(d).includes("KINGS TO CONFIRM")) {
      errors.push(`Development "${d.slug}": published with a [KINGS TO CONFIRM] placeholder`);
    }
    const units = d.unitTypes.reduce((n, u) => n + u.unitCount, 0);
    if (d.totalUnits !== null && d.unitTypes.length && units !== d.totalUnits) {
      errors.push(`Development "${d.slug}": unit types add up to ${units}, not totalUnits ${d.totalUnits}`);
    }
    const typeSlugs = new Set(d.unitTypes.map((u) => u.slug));
    if (typeSlugs.size !== d.unitTypes.length) errors.push(`Development "${d.slug}": duplicate unit type slug`);
  }
  if (errors.length) throw new Error(`Invalid development data:\n  ${errors.join("\n  ")}`);
}

validateDevelopments(developments, getCompanies().map((c) => c.slug));

/* -------------------------------------------------------------------------- */
/* Getters                                                                    */
/* -------------------------------------------------------------------------- */

export function getAllDevelopments(): Development[] {
  return developments;
}

/** Published only — what pages, nav and the sitemap may show. */
export function getDevelopments(): Development[] {
  return developments.filter((d) => d.published);
}

export function getDevelopment(slug: string): Development | undefined {
  return getDevelopments().find((d) => d.slug === slug);
}

export function getUnitType(dev: Development, slug: string): UnitType | undefined {
  return dev.unitTypes.find((u) => u.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const SQM_PER_SQFT = 0.09290304;

/** "665 sq ft (62 m²)" */
export function formatSize(sqft: number): string {
  return `${sqft.toLocaleString("en-US")} sq ft (${Math.round(sqft * SQM_PER_SQFT)} m²)`;
}

/** "KES 6,500,000" or "Price on request". */
export function formatPrice(kes: number | null): string {
  return kes === null ? "Price on request" : `KES ${kes.toLocaleString("en-US")}`;
}

/** Smallest unit size, for "from 665 sq ft". */
export function minSizeSqft(d: Development): number | null {
  return d.unitTypes.length ? Math.min(...d.unitTypes.map((u) => u.sizeSqft)) : null;
}

export function bedBathLabel(u: UnitType): string {
  return `${u.bedrooms} bed · ${u.bathrooms} bath${u.hasSq ? " + DSQ" : ""}`;
}

export function developmentHref(d: Development, u?: UnitType): string {
  return `/developments/${d.slug}${u ? `/${u.slug}` : ""}`;
}

/**
 * Buyer enquiry link: /contact pre-filled with the development and unit type.
 * The lead's source is recorded as `development:<slug>[/<unit-type>]`.
 */
export function developmentEnquireHref(d: Development, u?: UnitType, enquiry?: string): string {
  const params = new URLSearchParams({ development: d.slug });
  if (u) params.set("unit", u.slug);
  if (enquiry) params.set("enquiry", enquiry);
  return `/contact?${params.toString()}`;
}

/** Brief 6: prefilled WhatsApp text. */
export function whatsappText(d: Development, u?: UnitType): string {
  const what = u ? `${d.name} – ${u.name} (${u.sizeSqft} sq ft)` : d.name;
  return `Hi, I'm interested in ${what}. Please share prices and the payment plan.`;
}
