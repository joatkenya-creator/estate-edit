/**
 * Marketplace SEO system — the single source of truth for how a user-posted
 * listing is presented to search engines, social previews, and buyers.
 *
 * Everything here is DERIVED from fields the seller actually filled in
 * (title, category, condition, price, currency, location). Nothing is
 * invented: if a field is empty it is simply left out of the output. Because
 * every listing page, category page, sitemap entry, and OG tag reads from
 * these helpers, each new paid listing automatically inherits the same
 * technical SEO treatment without any per-listing work.
 *
 * Client-safe (no server-only imports) — the listing card and CTA row use it too.
 */

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

export type MarketplaceCategory = {
  /** URL segment, e.g. "fine-art". */
  slug: string;
  /** `asset_category` enum value stored on the row, e.g. "fine_art". */
  value: string;
  /** Chip / breadcrumb label. */
  label: string;
  /** Used in headings + meta titles: "Furniture for Sale in Kenya". */
  noun: string;
  /** One-sentence lede for the category landing page. */
  intro: string;
  /** Shown as a top-level filter chip on /marketplace (the rest are long-tail). */
  primary: boolean;
};

/**
 * Every `asset_category` a seller can post into. Each one gets a crawlable
 * landing page at /marketplace/<slug>; only the ones that currently hold
 * listings are submitted in the sitemap (see app/sitemap.ts) and empty ones
 * are noindexed, so a category never becomes thin content.
 */
export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    slug: "furniture", value: "furniture", label: "Furniture", noun: "Furniture", primary: true,
    intro:
      "Beds, dining sets, sofas, wardrobes and occasional furniture listed directly by their owners — inspect the piece and deal with the seller.",
  },
  {
    slug: "fine-art", value: "fine_art", label: "Fine Art", noun: "Fine Art", primary: true,
    intro: "Original paintings, prints, sculpture and photography offered by private sellers and collectors.",
  },
  {
    slug: "jewellery", value: "jewelry", label: "Jewellery", noun: "Jewellery", primary: true,
    intro: "Fine and costume jewellery, watches and precious pieces listed by their owners.",
  },
  {
    slug: "vehicles", value: "vehicles", label: "Vehicles", noun: "Vehicles", primary: true,
    intro: "Cars, motorcycles and other vehicles offered directly by the people who own them.",
  },
  {
    slug: "collectibles", value: "collectibles", label: "Collectibles", noun: "Collectibles", primary: true,
    intro: "Rare, vintage and collectable objects — from ceramics and books to memorabilia.",
  },
  {
    slug: "designer", value: "designer", label: "Designer", noun: "Designer Pieces", primary: true,
    intro: "Designer fashion, accessories and homeware in pre-owned and as-new condition.",
  },
  {
    slug: "antiques", value: "antiques", label: "Antiques", noun: "Antiques", primary: true,
    intro: "Period furniture, decorative objects and heirlooms with genuine age and character.",
  },
  {
    slug: "equipment", value: "equipment", label: "Equipment", noun: "Equipment", primary: true,
    intro: "Tools, machinery and business equipment listed by owners and businesses winding down.",
  },
  {
    slug: "lighting", value: "lighting", label: "Lighting", noun: "Lighting", primary: false,
    intro: "Chandeliers, lamps and light fittings offered by private sellers.",
  },
  {
    slug: "rugs", value: "rugs", label: "Rugs", noun: "Rugs & Carpets", primary: false,
    intro: "Handmade and machine-woven rugs, runners and carpets listed by their owners.",
  },
  {
    slug: "fleet", value: "fleet", label: "Fleet", noun: "Fleet Vehicles", primary: false,
    intro: "Commercial fleet vehicles released by businesses restructuring or relocating.",
  },
  {
    slug: "inventory", value: "inventory", label: "Inventory", noun: "Surplus Inventory", primary: false,
    intro: "Surplus and end-of-line stock offered in bulk or as single lots.",
  },
  {
    slug: "office", value: "office", label: "Office", noun: "Office Furniture & Equipment", primary: false,
    intro: "Desks, chairs, storage and office equipment from offices downsizing or relocating.",
  },
  {
    slug: "other", value: "other", label: "Other", noun: "Items", primary: false,
    intro: "Everything else currently offered by sellers on The Estate Edit Marketplace.",
  },
];

const CATEGORY_BY_SLUG = new Map(MARKETPLACE_CATEGORIES.map((c) => [c.slug, c]));
const CATEGORY_BY_VALUE = new Map(MARKETPLACE_CATEGORIES.map((c) => [c.value, c]));

/** Resolve a URL segment to a category, or null if it isn't one (→ it's a listing slug). */
export function categoryBySlug(slug: string): MarketplaceCategory | null {
  return CATEGORY_BY_SLUG.get(slug.toLowerCase()) ?? null;
}

/** Resolve a stored `asset_category` enum value to its category definition. */
export function categoryByValue(value: string | null | undefined): MarketplaceCategory | null {
  return value ? CATEGORY_BY_VALUE.get(value) ?? null : null;
}

/** Human label for a stored category value ("fine_art" → "Fine Art"). */
export function categoryLabel(value: string | null | undefined): string {
  return categoryByValue(value)?.label ?? (value ?? "").replace(/_/g, " ");
}

/* -------------------------------------------------------------------------- */
/* Places                                                                      */
/* -------------------------------------------------------------------------- */

export type Place = {
  /** The specific area a seller typed, e.g. "Ngong Road". */
  area: string;
  /** The town/city that area sits in, e.g. "Nairobi". Same as `area` for a city. */
  city: string;
  /** URL segment for the area, e.g. "ngong-road". Empty when unrecognised. */
  slug: string;
  /** Display string: "Ngong Road, Nairobi" (or just "Nairobi" for a city). */
  label: string;
};

/**
 * Kenyan places we can recognise inside a seller's free-text location field.
 *
 * Ordered most-specific first: "Ngong Road" must win over a bare "Ngong"
 * match, and neighbourhoods must win over their city. This is a RECOGNITION
 * table, not a page generator — a location page only exists where a real
 * listing resolves to it.
 */
const PLACES: { area: string; city: string; aliases?: string[] }[] = [
  // Nairobi neighbourhoods / roads
  { area: "Ngong Road", city: "Nairobi", aliases: ["ngong rd"] },
  { area: "Karen", city: "Nairobi" },
  { area: "Runda", city: "Nairobi" },
  { area: "Muthaiga", city: "Nairobi" },
  { area: "Lavington", city: "Nairobi" },
  { area: "Kilimani", city: "Nairobi" },
  { area: "Kileleshwa", city: "Nairobi" },
  { area: "Westlands", city: "Nairobi" },
  { area: "Parklands", city: "Nairobi" },
  { area: "Gigiri", city: "Nairobi" },
  { area: "Spring Valley", city: "Nairobi" },
  { area: "Loresho", city: "Nairobi" },
  { area: "Kitisuru", city: "Nairobi" },
  { area: "Langata", city: "Nairobi", aliases: ["lang'ata"] },
  { area: "South B", city: "Nairobi" },
  { area: "South C", city: "Nairobi" },
  { area: "Embakasi", city: "Nairobi" },
  { area: "Donholm", city: "Nairobi" },
  { area: "Kasarani", city: "Nairobi" },
  { area: "Roysambu", city: "Nairobi" },
  { area: "Ruaka", city: "Nairobi" },
  { area: "Kikuyu", city: "Nairobi" },
  { area: "Ongata Rongai", city: "Nairobi", aliases: ["rongai"] },
  { area: "Syokimau", city: "Nairobi" },
  { area: "Nairobi CBD", city: "Nairobi" },
  // Towns / cities
  { area: "Nairobi", city: "Nairobi" },
  { area: "Juja", city: "Kiambu" },
  { area: "Thika", city: "Kiambu" },
  { area: "Ruiru", city: "Kiambu" },
  { area: "Kiambu", city: "Kiambu" },
  { area: "Mombasa", city: "Mombasa" },
  { area: "Diani", city: "Kwale" },
  { area: "Kwale", city: "Kwale" },
  { area: "Malindi", city: "Kilifi" },
  { area: "Kilifi", city: "Kilifi" },
  { area: "Naivasha", city: "Nakuru" },
  { area: "Nakuru", city: "Nakuru" },
  { area: "Eldoret", city: "Uasin Gishu" },
  { area: "Uasin Gishu", city: "Uasin Gishu" },
  { area: "Kisumu", city: "Kisumu" },
  { area: "Nanyuki", city: "Laikipia" },
  { area: "Laikipia", city: "Laikipia" },
  { area: "Athi River", city: "Machakos" },
  { area: "Machakos", city: "Machakos" },
  { area: "Kitengela", city: "Kajiado" },
  { area: "Ngong", city: "Kajiado" },
  { area: "Kajiado", city: "Kajiado" },
];

export function placeSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Resolve a URL segment back to a known place, or null. */
export function placeBySlug(slug: string): Place | null {
  const want = slug.toLowerCase();
  const hit = PLACES.find((p) => placeSlug(p.area) === want);
  if (!hit) return null;
  const sameName = hit.area.toLowerCase() === hit.city.toLowerCase();
  return {
    area: hit.area,
    city: hit.city,
    slug: placeSlug(hit.area),
    label: sameName ? hit.area : `${hit.area}, ${hit.city}`,
  };
}

/**
 * Recognise a place inside a seller's free-text location.
 *
 * "Ngong road opposite Raila odinga stadium" → Ngong Road, Nairobi.
 * Unrecognised text is returned as-is (label only, empty slug) so we never
 * invent a county for an address we don't actually know.
 */
export function resolvePlace(raw: string | null | undefined): Place | null {
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return null;
  const haystack = text.toLowerCase();

  for (const p of PLACES) {
    const needles = [p.area.toLowerCase(), ...(p.aliases ?? [])];
    if (needles.some((n) => haystack.includes(n))) {
      return placeBySlug(placeSlug(p.area));
    }
  }

  // Unknown location: keep the seller's own words, but give it no slug-backed
  // landing page (slug === "" means "not a browsable place").
  return { area: text, city: text, slug: "", label: text };
}

/* -------------------------------------------------------------------------- */
/* Listing copy                                                                */
/* -------------------------------------------------------------------------- */

export type SeoListing = {
  slug: string;
  title: string;
  description?: string | null;
  price: number | string;
  currency?: string | null;
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  primary_image_url?: string | null;
};

/** "KES 30,000" — in the currency the listing is actually priced in. */
export function formatListingPrice(price: number | string, currency?: string | null): string {
  return `${currency || "KES"} ${Number(price).toLocaleString("en-KE")}`;
}

/** The country a listing sits in, inferred from its pricing currency. */
export function listingCountry(currency?: string | null): { name: string; code: string } {
  return currency === "USD" ? { name: "United States", code: "US" } : { name: "Kenya", code: "KE" };
}

/**
 * The location phrase used in titles and descriptions:
 * "Ngong Road, Nairobi" → the buyer knows immediately where the item is.
 * Falls back to the country when the seller left the field blank.
 */
export function listingPlaceLabel(listing: SeoListing): string {
  return resolvePlace(listing.location)?.label ?? listingCountry(listing.currency).name;
}

/**
 * Search-result headline for a listing:
 *   "Treated Cyprus Wood 5/6 Bed for Sale in Ngong Road, Nairobi"
 *
 * The seller's own words are kept verbatim (whitespace-normalised only); we
 * add the buyer-intent phrase and the place, which is the shape of query
 * people actually type. Nothing is added twice if the seller already wrote it.
 */
export function listingSeoTitle(listing: SeoListing): string {
  const title = listing.title.replace(/\s+/g, " ").trim();
  const lower = title.toLowerCase();
  const place = resolvePlace(listing.location);
  const label = place?.label ?? listingCountry(listing.currency).name;
  const city = place?.slug ? place.city : label;

  const mentions = (needle: string) => lower.includes(needle.toLowerCase());
  const hasIntent = /\bfor sale\b/.test(lower);
  const hasPlace = mentions(place?.area ?? label) || mentions(city);

  if (hasIntent && hasPlace) return title;

  // Longest form first, then degrade: drop the neighbourhood before the city,
  // and the intent phrase before the place. A title Google truncates mid-word
  // loses more than one that says less.
  const candidates = hasPlace
    ? [`${title} for Sale`]
    : [
        `${title} for Sale in ${label}`,
        `${title} for Sale in ${city}`,
        `${title} in ${label}`,
        `${title} in ${city}`,
      ];

  return candidates.find((c) => c.length <= TITLE_BUDGET) ?? candidates[candidates.length - 1];
}

/**
 * Character budget for a listing's title tag. Google renders roughly 580px of
 * title, near enough 65 characters. Overrunning isn't penalised — it is simply
 * cut off — so the budget exists to decide WHICH words survive, not to make the
 * title as short as possible. Dropping "Ngong Road" costs a local keyword,
 * which is why the degrade order gives the place up last.
 */
const TITLE_BUDGET = 65;

/**
 * Append the brand only when it fits. A brand suffix helps click-through, but
 * not at the cost of truncating the place out of a local search result — and
 * the brand is already in the description, the OG tags and the breadcrumb.
 */
export function withBrand(title: string, brand = "Estate Edit"): string {
  const full = `${title} | ${brand}`;
  return full.length <= TITLE_BUDGET + 5 ? full : title;
}

const DESCRIPTION_BUDGET = 158;

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9/]+/g) ?? [];
}

/**
 * One genuinely informative clause from the seller's own description.
 *
 * Seller copy in this marketplace is not prose — it reads
 * "Table size(hight 80cm) leght 180cm) dept 100cm) with 6 dining chairs)",
 * using ")" as an ad-hoc separator and leaving brackets unclosed. So: split on
 * both sentence enders and ")", repair the fragments, throw away anything that
 * just restates the title, and take the first clause left. Preferring a clause
 * that carries a number picks the dimensions over the filler, which is what a
 * buyer scanning a search result actually wants.
 */
function descriptionSnippet(
  description: string | null | undefined,
  title: string,
): string {
  const text = (description ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  const titleWords = new Set(words(title));
  const clauses = text
    .split(/(?<=[.!?])\s|\)\s*/)
    .map((clause) => {
      // An unclosed "(" means the closing bracket was the separator we just
      // split on — keep only the part before it rather than emit "size(hight".
      const open = clause.indexOf("(");
      const repaired = open >= 0 && !clause.includes(")") ? clause.slice(0, open) : clause;
      return repaired.replace(/^[\s,;:.)-]+|[\s,;:.)-]+$/g, "");
    })
    .filter((clause) => {
      if (clause.length < 12) return false;
      // Skip a clause that only repeats the title — the title is already in
      // the sentence before it.
      const w = words(clause);
      const overlap = w.filter((x) => titleWords.has(x)).length;
      return overlap / w.length < 0.7;
    });

  const informative = clauses.find((c) => /\d/.test(c)) ?? clauses[0] ?? "";
  return informative.length > 90 ? "" : informative;
}

/**
 * Unique meta description per listing: what it is, where it is, what it costs,
 * one real detail in the seller's own words, and a clear next step.
 *
 * Assembled longest-first and trimmed to fit rather than written long and
 * clamped: a description Google cuts mid-sentence loses its call to action,
 * which is the part that earns the click. When something has to go, the
 * seller's concrete detail outranks the generic invitation.
 */
export function listingMetaDescription(listing: SeoListing): string {
  const title = listing.title.replace(/\s+/g, " ").trim();
  const place = listingPlaceLabel(listing);
  const price = formatListingPrice(listing.price, listing.currency);

  const lead = `${title} for sale in ${place} — ${price}.`;
  const detail = descriptionSnippet(listing.description, title);
  const cta = "Photos and seller contact on The Estate Edit Marketplace.";

  const full = [lead, detail && `${detail}.`, cta].filter(Boolean).join(" ");
  if (full.length <= DESCRIPTION_BUDGET) return full;

  const withoutCta = [lead, detail && `${detail}.`].filter(Boolean).join(" ");
  if (withoutCta.length <= DESCRIPTION_BUDGET) return withoutCta;

  return `${lead} ${cta}`.length <= DESCRIPTION_BUDGET ? `${lead} ${cta}` : lead;
}

/**
 * Alt text describing the actual object in the photo, in the words a person
 * would use. No keyword stuffing — it is the product, its condition, and where.
 */
export function listingImageAlt(listing: SeoListing): string {
  const condition = listing.condition?.replace(/_/g, " ");
  const place = resolvePlace(listing.location)?.label;
  return [
    listing.title.replace(/\s+/g, " ").trim(),
    condition ? `(${condition})` : "",
    place ? `for sale in ${place}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Prefilled WhatsApp / email enquiry text, so the seller knows what it's about. */
export function listingEnquiryText(listing: SeoListing, url: string): string {
  return `Hi, I saw your listing on The Estate Edit — "${listing.title}" at ${formatListingPrice(
    listing.price,
    listing.currency,
  )}. Is it still available? ${url}`;
}

/* -------------------------------------------------------------------------- */
/* Category / location page copy                                               */
/* -------------------------------------------------------------------------- */

/** "Furniture for Sale in Nairobi" / "Furniture for Sale in Kenya". */
export function categoryHeading(category: MarketplaceCategory, place?: Place | null): string {
  return `${category.noun} for Sale in ${place ? place.label : "Kenya"}`;
}

export function categoryMetaTitle(category: MarketplaceCategory, place?: Place | null): string {
  return place
    ? `${category.noun} for Sale in ${place.label} | Estate Edit Marketplace`
    : `${category.noun} for Sale in Kenya | Curated Marketplace | Estate Edit`;
}

export function categoryMetaDescription(
  category: MarketplaceCategory,
  place: Place | null,
  count: number,
): string {
  const where = place ? place.label : "Kenya";
  const n = count > 0 ? `${count} listing${count === 1 ? "" : "s"}` : "listings";
  return `Browse ${n} of ${category.noun.toLowerCase()} for sale in ${where} on The Estate Edit Marketplace. ${category.intro} Contact sellers directly by WhatsApp or phone.`;
}

/** Is this place a town/city in its own right, rather than a neighbourhood of one? */
export function isCityPlace(place: Place): boolean {
  return place.area.toLowerCase() === place.city.toLowerCase();
}

/** The city a place belongs to, as a browsable place — or null if we have no page for it. */
export function cityOf(place: Place): Place | null {
  if (isCityPlace(place)) return null;
  const city = placeBySlug(placeSlug(place.city));
  return city && city.slug !== place.slug ? city : null;
}

/**
 * Does a listing sit inside `place`?
 *
 * A neighbourhood matches exactly. A CITY also matches every neighbourhood
 * inside it — Ngong Road is in Nairobi, so a listing there belongs on
 * /marketplace/furniture/nairobi as well as /marketplace/furniture/ngong-road.
 * Without this a city page is always empty (sellers type a street, not a city),
 * which loses the highest-volume local query the marketplace has.
 */
export function placeMatches(location: string | null | undefined, place: Place): boolean {
  const resolved = resolvePlace(location);
  if (!resolved?.slug) return false;
  if (resolved.slug === place.slug) return true;
  return isCityPlace(place) && resolved.city.toLowerCase() === place.city.toLowerCase();
}

/**
 * Does a seller's free-text location fall under this URL slug?
 *
 * Bridges the two slug vocabularies that already exist: `areaSlug()` in
 * region.ts (for the "Areas Served" marketing pages) and `placeSlug()` here.
 * They agree for every Nairobi neighbourhood, which is exactly where the two
 * sets overlap.
 */
export function areaSlugMatches(location: string | null | undefined, slug: string): boolean {
  const place = placeBySlug(slug);
  return place ? placeMatches(location, place) : false;
}
