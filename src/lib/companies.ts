/**
 * Developers and agencies that list residences on `/residences`.
 *
 * The shape mirrors a future
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
  /** Registered name, used in attribution and consent text. */
  legalName?: string;
  /** Head office, shown on the profile. */
  address?: string;
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
    // From the Kings Lotus brochure and drawing title blocks (brief 2.1).
    // about/shortDescription: replace with Kings-approved copy (brief 12 #11).
    slug: "kings-developers",
    name: "Kings Developers",
    legalName: "Kings Developers Limited",
    shortDescription:
      "Kings Developers Limited, \"enhancing lifestyle\": a Nairobi property developer headquartered on Karen Road, Karen.",
    about:
      "Kings Developers Limited is a property developer headquartered at Royal Group Headquarters, Karen Road, opposite The Water Front, Karen, Nairobi. Its first project marketed by The Estate Edit is Kings Lotus.",
    roles: ["developer"],
    website: "https://www.kingsdevelopers.com",
    phone: "+254 700 090 060",
    email: "sales@kingsdevelopers.com",
    address: "Royal Group Headquarters, Karen Road, opposite The Water Front, Karen, Nairobi. P.O. Box 18215-00500",
    areas: ["Ongata Rongai"],
    verified: false,
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

/** "Kings Developers" -> "KD" — the badge shown when there's no logo. */
export function companyInitials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
