/**
 * Static site content for The Estate Edit.
 *
 * This mirrors the shape of the Supabase tables (services, site_stats,
 * testimonials, assets, …) so individual sections can later be swapped to
 * live database queries without changing their markup.
 */

export const siteConfig = {
  name: "The Estate Edit",
  tagline: "Luxury Estates. Commercial Liquidations. Seamless Transitions.",
  description:
    "A luxury estate advisory and transition management firm trusted by affluent families, expatriates, and businesses across East Africa.",
  location: "Nairobi, Kenya",
  email: "concierge@theestateedit.co.ke",
  phone: "+254 700 000 000",
  social: {
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
  },
};

export const navLinks = [
  { label: "Estate Sales", href: "/estate-sales" },
  { label: "Commercial Liquidation", href: "/commercial-liquidation" },
  { label: "Expat Services", href: "/expat-services" },
  { label: "Collection", href: "/collection" },
  { label: "About", href: "/about" },
] as const;

export type Service = {
  slug: string;
  division: "estate_sales" | "commercial_liquidation" | "concierge" | "expat_services";
  icon: "estate" | "commercial" | "concierge";
  title: string;
  summary: string;
  offerings: string[];
};

export const services: Service[] = [
  {
    slug: "estate-sales",
    division: "estate_sales",
    icon: "estate",
    title: "Estate Sales",
    summary:
      "Full-service management and sale of luxury households, inherited estates, fine art, jewellery, and collector vehicles.",
    offerings: [
      "Inventory & cataloguing",
      "Editorial photography",
      "Pricing & valuation",
      "Private buyer outreach",
      "Luxury estate events",
      "Consignment sales",
    ],
  },
  {
    slug: "commercial-liquidation",
    division: "commercial_liquidation",
    icon: "commercial",
    title: "Commercial Liquidation",
    summary:
      "Discreet, value-maximising disposal of business assets for closures, relocations, and fleet or warehouse reductions.",
    offerings: [
      "Asset inventory & cataloguing",
      "Equipment & fleet liquidation",
      "Buyer sourcing",
      "Online auctions",
      "Direct & negotiated sales",
      "Warehouse clearance",
    ],
  },
  {
    slug: "concierge-transition",
    division: "concierge",
    icon: "concierge",
    title: "Concierge Transition",
    summary:
      "White-glove support for major life changes — downsizing, relocation, cleanouts, and complete property preparation.",
    offerings: [
      "Downsizing & relocation",
      "Estate cleanouts",
      "Property preparation",
      "Donation coordination",
      "Vendor management",
      "Storage solutions",
    ],
  },
];

/** Shape consumed by the animated count-up in the Stats section. */
export type Metric = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
};

export const statMetrics: Metric[] = [
  { to: 2400, suffix: "+", label: "Assets sold" },
  { to: 180, suffix: "+", label: "Estates managed" },
  { to: 65, suffix: "+", label: "Businesses assisted" },
  { to: 1.2, prefix: "KES ", suffix: "B", decimals: 1, label: "Client value realised" },
];

/** Maps the `asset_category` enum to a display label. */
export const assetCategoryLabel: Record<string, string> = {
  furniture: "Furniture",
  fine_art: "Artwork",
  jewelry: "Jewellery",
  vehicles: "Vehicles",
  collectibles: "Collectibles",
  designer: "Designer",
  lighting: "Lighting",
  rugs: "Rugs",
  antiques: "Antiques",
  equipment: "Equipment",
  fleet: "Fleet",
  inventory: "Inventory",
  office: "Office",
  other: "Other",
};

export type FeaturedAsset = {
  slug: string;
  title: string;
  category: string;
  meta: string;
  status: "available" | "sold" | "reserved";
  tone: "navy" | "gold" | "crimson" | "charcoal";
  imageUrl?: string;
};

/** A catalogue row — a FeaturedAsset plus the raw enum keys used for filtering. */
export type CatalogueItem = FeaturedAsset & {
  categoryKey: string;
  division: string;
};

export const divisionLabel: Record<string, string> = {
  estate_sales: "Estate Sales",
  commercial_liquidation: "Commercial Liquidation",
  concierge: "Concierge",
  expat_services: "Expat Services",
};

export const featuredAssets: FeaturedAsset[] = [
  {
    slug: "italian-walnut-suite",
    title: "Italian Walnut Dining Suite",
    category: "Furniture",
    meta: "Karen Estate · Seats 12",
    status: "available",
    tone: "navy",
  },
  {
    slug: "land-cruiser-vx",
    title: "Land Cruiser VX — 2022",
    category: "Vehicles",
    meta: "Single owner · 18,000 km",
    status: "reserved",
    tone: "charcoal",
  },
  {
    slug: "contemporary-canvas",
    title: "Contemporary East African Canvas",
    category: "Artwork",
    meta: "Signed · Provenance verified",
    status: "available",
    tone: "crimson",
  },
  {
    slug: "diamond-solitaire",
    title: "Diamond Solitaire, 3.1ct",
    category: "Jewellery",
    meta: "GIA certified · Platinum",
    status: "sold",
    tone: "gold",
  },
  {
    slug: "commercial-kitchen",
    title: "Commercial Kitchen Line",
    category: "Equipment",
    meta: "Hotel-grade · 40 lots",
    status: "available",
    tone: "navy",
  },
  {
    slug: "executive-fleet",
    title: "Executive Sedan Fleet",
    category: "Fleet",
    meta: "Corporate downsizing · 8 units",
    status: "available",
    tone: "charcoal",
  },
];

export type ProcessStep = { index: string; title: string; description: string };

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Consultation",
    description:
      "A private, no-obligation conversation to understand your transition, timeline, and goals.",
  },
  {
    index: "02",
    title: "Inventory & Valuation",
    description:
      "Professional cataloguing and market valuation of every asset, documented to museum standard.",
  },
  {
    index: "03",
    title: "Marketing",
    description:
      "Editorial photography and targeted outreach to our private network of qualified buyers.",
  },
  {
    index: "04",
    title: "Sale",
    description:
      "Curated estate events, online auctions, and discreet private sales that maximise value.",
  },
  {
    index: "05",
    title: "Transition Support",
    description:
      "Logistics, cleanouts, donations, and property preparation — handled end to end.",
  },
];

export const clientTypes = [
  { title: "Families", description: "Navigating downsizing or inherited estates with dignity." },
  { title: "Estate Executors", description: "Settling estates efficiently and transparently." },
  { title: "Business Owners", description: "Closing, relocating, or reducing commercial assets." },
  { title: "Expats", description: "Arriving in or departing from Kenya with ease." },
  { title: "Embassies", description: "Diplomatic relocations handled with discretion." },
  { title: "Corporations", description: "Fleet, office, and warehouse liquidation at scale." },
] as const;

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  location: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "They turned an overwhelming family estate into a calm, dignified process — and realised far more than we expected.",
    author: "A. Mwangi",
    role: "Estate Executor",
    location: "Muthaiga",
  },
  {
    quote:
      "Relocating our regional office could have been chaos. The Estate Edit liquidated everything with total discretion.",
    author: "Country Director",
    role: "Multinational Corporation",
    location: "Westlands",
  },
  {
    quote:
      "As an expat family leaving Nairobi, they handled our entire household sale and move. White-glove from start to finish.",
    author: "The Bauer Family",
    role: "Expat Departure",
    location: "Runda",
  },
];

export const clientSegments = [
  { value: "family", label: "Family / Individual" },
  { value: "estate_executor", label: "Estate Executor" },
  { value: "business_owner", label: "Business Owner" },
  { value: "expat", label: "Expat (Arriving / Leaving)" },
  { value: "embassy", label: "Embassy / Diplomatic" },
  { value: "corporation", label: "Corporation" },
] as const;

export const serviceOptions = [
  { value: "estate_sales", label: "Estate Sales" },
  { value: "commercial_liquidation", label: "Commercial Liquidation" },
  { value: "concierge", label: "Concierge Transition" },
  { value: "expat_services", label: "Expat Services" },
] as const;
