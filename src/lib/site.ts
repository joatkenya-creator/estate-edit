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
  email: "info@estateedit.org",
  phone: "+254 142 378 150",
  social: {
    instagram: "https://www.instagram.com/joat.kenya?igsh=MXZraTR5enF4OTVpaQ==",
    linkedin: "https://www.linkedin.com/company/joat-kenya-jack-urban-services-ltd/",
  },
};

export const navLinks = [
  { label: "Estate Sales", href: "/estate-sales" },
  { label: "Commercial Liquidation", href: "/commercial-liquidation" },
  { label: "Concierge", href: "/concierge" },
  { label: "Expat Services", href: "/expat-services" },
  { label: "Collection", href: "/collection" },
  { label: "Marketplace", href: "/marketplace" },
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
      "White-glove support for major life changes: downsizing, relocation, cleanouts, and complete property preparation.",
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

/**
 * Region-localised marketing content. The Virginia storefront swaps Kenya / East
 * Africa references for Virginia (location, served areas, the "across ___"
 * phrase) and drops the KES client-value stat (US shoppers shouldn't see a KES
 * figure). Consumed by the footer (client `useRegion`), the stats data layer
 * (server `getRegion`), the hero, and the contact section.
 */
export const regionContent = {
  kenya: {
    place: "Kenya",
    location: "Nairobi, Kenya",
    description:
      "A luxury estate advisory and transition management firm trusted by affluent families, expatriates, and businesses across East Africa.",
    serves: "East Africa",
    lede: "A white-glove luxury estate sales and transition firm in Kenya, trusted by affluent families, expatriates, and businesses across East Africa, combining valuation, marketing, sale, and logistics under one premium brand.",
    areasServed: ["Karen", "Runda", "Muthaiga", "Lavington", "Kilimani", "Westlands"],
    stats: [
      { to: 2400, suffix: "+", label: "Assets sold" },
      { to: 180, suffix: "+", label: "Estates managed" },
      { to: 65, suffix: "+", label: "Businesses assisted" },
      { to: 1.2, prefix: "KES ", suffix: "B", decimals: 1, label: "Client value realised" },
    ] as Metric[],
  },
  virginia: {
    place: "Virginia",
    location: "Chesapeake, Virginia",
    description:
      "A luxury estate advisory and transition management firm trusted by affluent families, professionals, and businesses across Virginia.",
    serves: "Virginia",
    lede: "A white-glove luxury estate sales and transition firm serving Virginia, trusted by affluent families, professionals, and collectors statewide, combining valuation, marketing, sale, and logistics under one premium brand.",
    areasServed: ["McLean", "Great Falls", "Vienna", "Arlington", "Alexandria", "Virginia Beach"],
    stats: [
      { to: 2400, suffix: "+", label: "Assets sold" },
      { to: 180, suffix: "+", label: "Estates managed" },
      { to: 65, suffix: "+", label: "Businesses assisted" },
      { to: 30, suffix: "+", label: "Virginia areas served" },
    ] as Metric[],
  },
} as const;

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

/** A catalogue row: a FeaturedAsset plus the raw enum keys used for filtering. */
export type CatalogueItem = FeaturedAsset & {
  categoryKey: string;
  division: string;
  // Commerce fields (so cards can offer Add to cart for buyable items).
  price?: number;
  currency?: string;
  priceOnRequest?: boolean;
  deliveryTier?: string;
  fragile?: boolean;
};

export type AssetImage = { url: string; alt: string };

/** Full asset record powering the individual asset detail page. */
export type AssetDetail = CatalogueItem & {
  description?: string;
  condition?: string;
  brand?: string;
  era?: string;
  provenance?: string;
  dimensions?: string;
  location?: string;
  price?: number;
  currency: string;
  priceOnRequest: boolean;
  tags: string[];
  images: AssetImage[];
  deliveryTier?: string;
  fragile?: boolean;
};

// ----- Commerce (Phase 2: self-checkout) -----

/** Format an amount like "KES 45,000". */
export function formatMoney(amount: number, currency = "KES"): string {
  return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
}

/** A line in the shopping cart (persisted client-side). */
export type CartItem = {
  slug: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  /** Size/weight band — drives the handling surcharge. */
  deliveryTier?: string;
  /** Fragile items add the fragile surcharge. */
  fragile?: boolean;
};

/** Delivery settings read from the CMS `delivery` global (with fallbacks). */
export type DeliverySettings = {
  /** Storefront these settings apply to. */
  market: "kenya" | "virginia";
  /** Native currency for this market (KES / USD). */
  currency: string;
  enabled: boolean;
  message: string;
  details: string;
  /** Distance base fee when no per-destination rate is set. */
  flatFee: number;
  freeAbove: number | null;
  /** Per-destination distance base (counties for KE, localities for VA). */
  countyRates: Record<string, number>;
  /** Handling add-on per size tier, e.g. { standard: 0, bulky: 1500 }. */
  tierSurcharges: Record<string, number>;
  /** Extra added for a fragile item. */
  fragileSurcharge: number;
  /** Destination dropdown options (county / locality names). */
  areas: string[];
  /** Label for the destination field ("County" / "Locality"). */
  areaLabel: string;
  /** VA: offer an "outside Virginia" choice that defers shipping to a quote. */
  quoteOutsideArea: boolean;
};

/** County base fees (KSh) — anchored at the Nairobi 800 floor, scaled by
 * distance from the Fargo/G4S domestic rate shape. Mirrors the CMS default. */
export const defaultCountyRates: Record<string, number> = {
  Nairobi: 800, Kiambu: 950, Kajiado: 950, Machakos: 1050, Makueni: 1150,
  "Murang'a": 950, Kirinyaga: 1050, Nyandarua: 1050, Nyeri: 1100, Laikipia: 1300,
  Embu: 1100, "Tharaka-Nithi": 1200, Meru: 1150, Kitui: 1200, Nakuru: 950,
  Narok: 1050, Bomet: 1250, Kericho: 1200, Nandi: 1400, "Uasin Gishu": 1150,
  "Elgeyo-Marakwet": 1300, Baringo: 1300, "Trans Nzoia": 1400, "West Pokot": 1600,
  Samburu: 1800, Turkana: 2500, Kakamega: 1200, Vihiga: 1250, Bungoma: 1450,
  Busia: 1450, Siaya: 1350, Kisumu: 1250, "Homa Bay": 1400, Migori: 1500,
  Kisii: 1250, Nyamira: 1300, Mombasa: 1500, Kwale: 1650, Kilifi: 1600,
  "Tana River": 1900, Lamu: 2000, "Taita-Taveta": 1500, Garissa: 2000,
  Wajir: 2500, Mandera: 2800, Marsabit: 2300, Isiolo: 1500,
};

export const defaultDeliverySettings: DeliverySettings = {
  market: "kenya",
  currency: "KES",
  enabled: true,
  message: "We deliver countrywide",
  details: "",
  flatFee: 800,
  freeAbove: null,
  countyRates: defaultCountyRates,
  tierSurcharges: { standard: 0, medium: 400, large: 800, bulky: 1500 },
  fragileSurcharge: 500,
  areas: [],
  areaLabel: "County",
  quoteOutsideArea: false,
};

/** US states + DC — the "outside Virginia" checkout destination dropdown. */
export const usStates: string[] = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

/**
 * An asset is buyable (Buy now) only when it has a real price and isn't sold.
 * Price-on-request / luxury pieces fall through to Enquire-only.
 */
export function isPurchasable(a: {
  price?: number | null;
  priceOnRequest?: boolean;
  status?: string;
}): boolean {
  return (
    !a.priceOnRequest &&
    typeof a.price === "number" &&
    a.price > 0 &&
    a.status !== "sold"
  );
}

/** Per-item handling add-on = its size-tier surcharge + (fragile ? fragile surcharge). */
export function itemHandling(settings: DeliverySettings, item: CartItem): number {
  const tier = item.deliveryTier ?? "standard";
  const tierFee = settings.tierSurcharges[tier] ?? 0;
  const fragileFee = item.fragile ? settings.fragileSurcharge : 0;
  return tierFee + fragileFee;
}

/**
 * Delivery fee = county base (distance) + the single largest item's handling
 * add-on (size/weight + fragile). Free when disabled or subtotal ≥ freeAbove.
 */
export function computeDeliveryFee(
  settings: DeliverySettings,
  county: string | null | undefined,
  items: CartItem[],
): number {
  if (!settings.enabled) return 0;

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  if (settings.freeAbove != null && subtotal >= settings.freeAbove) return 0;

  const base =
    (county && settings.countyRates[county] != null
      ? settings.countyRates[county]
      : settings.flatFee) || 0;

  const handling = items.reduce((max, it) => Math.max(max, itemHandling(settings, it)), 0);

  return base + handling;
}

/** Kenya's 47 counties — the delivery destination dropdown at checkout. */
export const kenyaCounties: string[] = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

export const divisionLabel: Record<string, string> = {
  estate_sales: "Estate Sales",
  commercial_liquidation: "Commercial Liquidation",
  concierge: "Concierge",
  expat_services: "Expat Services",
};

/** Maps a service division to its dedicated marketing page. */
export const divisionHref: Record<string, string> = {
  estate_sales: "/estate-sales",
  commercial_liquidation: "/commercial-liquidation",
  concierge: "/concierge",
  expat_services: "/expat-services",
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
    title: "Land Cruiser VX 2022",
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
      "Logistics, cleanouts, donations, and property preparation, handled end to end.",
  },
];

export const clientTypes = [
  { title: "High-Net-Worth Individuals", description: "Discreet management and sale of significant personal assets and collections." },
  { title: "Luxury Homeowners", description: "Downsizing, relocating, or curating the contents of distinguished homes." },
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
      "They turned an overwhelming family estate into a calm, dignified process, and realised far more than we expected.",
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
  { value: "individual", label: "High-Net-Worth Individual / Luxury Homeowner" },
  { value: "family", label: "Family" },
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
