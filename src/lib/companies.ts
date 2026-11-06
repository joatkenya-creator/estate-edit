/**
 * Developers and agencies that list residences on `/residences`.
 *
 * SAMPLE DATA: all three companies are fictional. The shape mirrors a future
 * DB row (flat, typed, keyed by `slug`); components only use the getters below,
 * so swapping the array for a query later doesn't touch them.
 *
 * Kept free of `@/` imports so the `.check.ts` files can run under plain Node.
 */

export type CompanyRole = "developer" | "agency";

export interface Company {
  slug: string;
  name: string;
  /** Square-ish mark; rendered contained in a fixed box, so any ratio is fine. */
  logoUrl?: string;
  /** Max 160 chars (enforced by `validateListings`). */
  shortDescription: string;
  about: string;
  /** One company can be both. */
  roles: CompanyRole[];
  website?: string;
  phone?: string;
  email?: string;
  tiktok?: string;
  instagram?: string;
  /** Sample of TikTok/Instagram video URLs shown on the profile; the rest live on their socials. */
  videos?: string[];
  /** Neighbourhoods they work in. */
  areas: string[];
  verified: boolean;
  yearFounded?: number;
}

export const ROLE_LABEL: Record<CompanyRole, string> = { developer: "Developer", agency: "Agency" };

const companies: Company[] = [
  {
    slug: "kijani-ridge-developments",
    name: "Kijani Ridge Developments",
    shortDescription:
      "Builds low-density family homes on large garden plots, with an emphasis on natural stone, timber and mature landscaping.",
    about:
      "Kijani Ridge Developments designs and builds a small number of detached homes each year, mostly on half-acre to two-acre plots. Every project is planned around existing trees and drainage, and finished with locally quarried stone and sustainably sourced hardwood. They sell through selected agencies rather than directly.",
    roles: ["developer"],
    website: "https://example.com/kijani-ridge",
    areas: ["Karen", "Runda", "Muthaiga"],
    verified: true,
    yearFounded: 2009,
  },
  {
    slug: "mvule-and-hart-realty",
    name: "Mvule & Hart Realty",
    shortDescription:
      "A boutique agency representing private sellers of distinguished homes across Nairobi's established neighbourhoods.",
    about:
      "Mvule & Hart Realty is a small brokerage that handles the sale of established family homes, from valuation and staging through to handover. They work with private owners and with developers who prefer not to run their own sales teams.",
    roles: ["agency"],
    phone: "+254 700 000 001",
    email: "hello@example.com",
    areas: ["Lavington", "Kilimani", "Westlands", "Karen"],
    verified: false,
  },
  {
    slug: "savanna-crest-homes",
    name: "Savanna Crest Homes",
    shortDescription:
      "Develops and sells contemporary apartments, penthouses and townhouses, from off-plan through to completed units.",
    about:
      "Savanna Crest Homes develops mid-rise apartment buildings and gated townhouse communities, and sells the units through its own in-house sales team. Completed buildings are managed by the company for the first two years after handover.",
    roles: ["developer", "agency"],
    website: "https://example.com/savanna-crest",
    phone: "+254 700 000 002",
    areas: ["Westlands", "Kilimani", "Lavington", "Runda"],
    verified: true,
    yearFounded: 2014,
  },
  {
    slug: "luxury-creations",
    name: "Luxury Creations",
    shortDescription:
      "Premium homes, exclusive Airbnbs and investment properties, from Westlands apartments to beachfront villas on the Kenyan coast.",
    about:
      "Luxury Creations markets premium residences and short-stay properties: executive apartments in Nairobi and private villas and beachfront stays in Nyali, Vipingo and Kilifi. They share property tours on TikTok and Instagram; message them there for prices and availability.",
    roles: ["agency"],
    tiktok: "https://www.tiktok.com/@luxurycreation.s",
    instagram: "https://www.instagram.com/lu.xurycreations/",
    // ponytail: hand-picked sample, refresh by hand when they post new tours.
    videos: [
      "https://www.instagram.com/reel/DdBJMZSxBvs/", // 2-bed executive unit, Westlands
      "https://www.instagram.com/reel/DcdCq-yNavp/", // private villa, Kilifi
      "https://www.instagram.com/reel/DcS-GQ_xlzR/", // beachfront stay, Nyali
      "https://www.instagram.com/reel/DcL2SvBtqv-/", // Vipingo
    ],
    areas: ["Westlands", "Nyali", "Vipingo", "Kilifi"],
    verified: false,
  },
];

export function getCompanies(): Company[] {
  return companies;
}

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

/** "Mvule & Hart Realty" -> "MH" — the badge shown when there's no logo. */
export function companyInitials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
