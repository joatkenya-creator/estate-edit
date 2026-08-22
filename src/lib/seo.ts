/**
 * SEO constants + JSON-LD (schema.org) builders for The Estate Edit.
 *
 * The business operates from Nairobi, Kenya and additionally TARGETS the
 * Virginia (USA) market — it has no physical presence there, so Virginia is
 * modelled as an `areaServed`, not an address/location.
 */
import type { Metadata } from "next";
import { siteConfig, type AssetDetail } from "./site";
import { type Region } from "./region";
import {
  categoryByValue,
  listingCountry,
  listingMetaDescription,
  resolvePlace,
  type SeoListing,
} from "./marketplace";

/** Canonical production origin (Kenya / primary market). */
export const SITE_URL = "https://estateedit.org";

/** Virginia (USA) storefront origin — the `us.` subdomain. */
export const US_SITE_URL = "https://us.estateedit.org";

/** Origin for a given market. */
export function siteUrlForRegion(region: Region): string {
  return region === "virginia" ? US_SITE_URL : SITE_URL;
}

/**
 * Region-aware canonical + hreflang alternates for a page. Each market
 * self-references its own host (so both are indexed, not deduped), and the
 * hreflang set tells Google which URL to serve each searcher. Kenya is
 * `x-default`. Apply this in the `generateMetadata` of every region-varying
 * page (pass the resolved `getRegion()`).
 */
export function regionAlternates(path: string, region: Region): NonNullable<Metadata["alternates"]> {
  const suffix = path === "/" ? "/" : path;
  return {
    canonical: `${siteUrlForRegion(region)}${suffix}`,
    languages: {
      "en-KE": `${SITE_URL}${suffix}`,
      "en-US": `${US_SITE_URL}${suffix}`,
      "x-default": `${SITE_URL}${suffix}`,
    },
  };
}

/** Default social/share image (absolute). */
export const OG_IMAGE = `${SITE_URL}/hero/estate.jpg`;

/** Absolute canonical URL for a root-relative path (e.g. "/collection"). */
export function canonicalUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * Full `openGraph` object for a page. Next.js REPLACES (doesn't deep-merge)
 * the parent layout's `openGraph` whenever a route defines its own, so every
 * page that sets one must supply the full shape itself — otherwise it silently
 * loses `siteName`/`locale`/`og:url` from the root layout.
 */
export function buildOpenGraph({
  title,
  description,
  path,
  images,
  type = "website",
  region = "kenya",
}: {
  title: string;
  description: string;
  path: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  type?: "website" | "article";
  region?: Region;
}): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    description,
    url: `${siteUrlForRegion(region)}${path === "/" ? "/" : path}`,
    siteName: siteConfig.name,
    locale: region === "virginia" ? "en_US" : "en_KE",
    type,
    images: images ?? [{ url: OG_IMAGE, width: 1200, height: 630, alt: siteConfig.name }],
  };
}

/** Clamp text to a display-friendly meta description length without cutting mid-word. */
export function clampDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/**
 * Clamp a CMS/user-entered title (asset name, listing title) to a search-
 * result-friendly length without cutting mid-word. Default budget leaves
 * room for the " · The Estate Edit" suffix the root layout's title template
 * appends, so the rendered <title> stays under ~60 characters.
 */
export function clampTitle(text: string, max = 48): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

/** Fallback description for a catalogue asset with no editor-written copy. */
export function assetFallbackDescription(asset: Pick<AssetDetail, "title" | "category">): string {
  return `${asset.title} — ${asset.category} available through ${siteConfig.name}, Nairobi. Viewing by appointment; enquire in confidence.`;
}

/** Phone in E.164 (digits + leading +), required by schema.org. */
const phoneE164 = siteConfig.phone.replace(/[^\d+]/g, "");

/**
 * Organization / local-business schema for the whole site. Rendered once in
 * the root layout so every page carries it.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: siteConfig.name,
    url: SITE_URL,
    image: OG_IMAGE,
    // No `logo` field: Google's Logo rich-result spec requires a roughly
    // square image (not wider than tall). OG_IMAGE is a 1200x630 landscape
    // hero photo — using it as `logo` fails that validation on every page
    // (this schema renders site-wide via the root layout). Omitting an
    // optional field is safer than shipping an image that fails the check;
    // add a real square logo asset here if the Logo rich result matters.
    description: siteConfig.description,
    telephone: phoneE164,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    areaServed: [
      { "@type": "Country", name: "Kenya" },
      { "@type": "AdministrativeArea", name: "Virginia, USA" },
    ],
    sameAs: [siteConfig.social.instagram, siteConfig.social.linkedin],
  };
}

const AVAILABILITY: Record<AssetDetail["status"], string> = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

/** One year out, as YYYY-MM-DD (Google's expected `priceValidUntil` format). */
function oneYearFromNow(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Product schema for an individual catalogue asset. Returns null for
 * "price on request" items: Google requires `price` + `priceCurrency` on any
 * Offer that's present, so an Offer with neither is an invalid rich-results
 * error — omitting the whole block is correct until a real price exists.
 */
export function assetJsonLd(asset: AssetDetail) {
  const hasPrice = asset.price != null && !asset.priceOnRequest;
  if (!hasPrice) return null;

  // Each asset belongs to a single market — link to its own home domain, not
  // always the Kenya apex (see the matching canonical fix in
  // collection/[slug]/page.tsx).
  const assetOrigin = asset.currency === "USD" ? US_SITE_URL : SITE_URL;
  const url = `${assetOrigin}/collection/${asset.slug}`;
  const image = asset.images[0]?.url ?? asset.imageUrl ?? OG_IMAGE;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: asset.title,
    description: asset.description ?? assetFallbackDescription(asset),
    image: [image],
    category: asset.category,
    ...(asset.brand ? { brand: { "@type": "Brand", name: asset.brand } } : {}),
    offers: {
      "@type": "Offer",
      url,
      availability: AVAILABILITY[asset.status],
      price: asset.price,
      priceCurrency: asset.currency,
      priceValidUntil: oneYearFromNow(),
      // Signals "delivery available" countrywide for purchasable items.
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "KE",
        },
      },
      // A full inline object, not a bare `@id` pointer: the Organization
      // entity it would reference lives in a SEPARATE <script> tag (root
      // layout) from this Product block (asset page), and Google's Rich
      // Results validator generally can't resolve an @id across disconnected
      // JSON-LD blocks — it read as an invalid/unresolvable seller.
      seller: { "@type": "Organization", "@id": `${assetOrigin}/#organization`, name: siteConfig.name },
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Marketplace structured data                                                 */
/* -------------------------------------------------------------------------- */

/**
 * BreadcrumbList for any page with a visible breadcrumb trail. Pass the SAME
 * trail the page renders (Google requires the markup to match what a user
 * sees). The final crumb is the current page and needs no href.
 */
export function breadcrumbJsonLd(
  crumbs: { name: string; path?: string }[],
  origin: string = SITE_URL,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: `${origin}${c.path}` } : {}),
    })),
  };
}

/**
 * ItemList for a browse page (marketplace index, category, category+location).
 * Gives Google an explicit, ordered set of the listing URLs on the page —
 * a crawl path that doesn't depend on parsing the grid markup.
 */
export function itemListJsonLd(
  name: string,
  paths: string[],
  origin: string = SITE_URL,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: paths.length,
    itemListElement: paths.map((path, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${origin}${path}`,
    })),
  };
}

const LISTING_CONDITION: Record<string, string> = {
  new: "https://schema.org/NewCondition",
  excellent: "https://schema.org/UsedCondition",
  very_good: "https://schema.org/UsedCondition",
  good: "https://schema.org/UsedCondition",
  fair: "https://schema.org/UsedCondition",
};

/**
 * Product schema for a user-posted marketplace listing.
 *
 * Only facts the row actually carries are emitted:
 *   - `availability` is InStock because the page is only reachable while
 *     `status = 'active'` (sold/withdrawn rows 404) — that IS what the
 *     application knows.
 *   - `seller` is the real seller (a Person when they gave a name), not the
 *     platform: Estate Edit is the marketplace, the seller owns the item.
 *   - no rating/review block: there are no genuine reviews to represent.
 *   - `areaServed` / `availableAtOrFrom` carry the item's real location so
 *     Google can place the offer in Kenya.
 */
export function listingJsonLd(
  listing: SeoListing & { seller?: string | null; created_at?: string | null },
) {
  const origin = listing.currency === "USD" ? US_SITE_URL : SITE_URL;
  const url = `${origin}/marketplace/${listing.slug}`;
  const place = resolvePlace(listing.location);
  const country = listingCountry(listing.currency);
  const category = categoryByValue(listing.category);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    // The product's NAME, not the page's title: Google's merchant-listing spec
    // wants the thing itself here. The location it is offered in belongs in
    // `availableAtOrFrom` below, and the buyer-intent phrasing belongs in the
    // <title>, which is a different job.
    name: listing.title.replace(/\s+/g, " ").trim(),
    // The seller's own words when they wrote any; otherwise the derived
    // description, so the field is never empty.
    description: listing.description?.trim() || listingMetaDescription(listing),
    url,
    ...(listing.primary_image_url ? { image: [listing.primary_image_url] } : {}),
    ...(category ? { category: category.label } : {}),
    ...(listing.condition && LISTING_CONDITION[listing.condition]
      ? { itemCondition: LISTING_CONDITION[listing.condition] }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: Number(listing.price),
      priceCurrency: listing.currency || "KES",
      priceValidUntil: oneYearFromNow(),
      // The listing page 404s unless status = 'active', so a rendered page
      // genuinely means "still offered".
      availability: "https://schema.org/InStock",
      ...(place
        ? {
            availableAtOrFrom: {
              "@type": "Place",
              name: place.label,
              address: {
                "@type": "PostalAddress",
                ...(place.slug ? { addressLocality: place.city } : {}),
                addressCountry: country.code,
              },
            },
          }
        : {}),
      areaServed: { "@type": "Country", name: country.name },
      seller: listing.seller
        ? { "@type": "Person", name: listing.seller }
        : { "@type": "Organization", "@id": `${origin}/#organization`, name: siteConfig.name },
    },
    // The marketplace the offer is published on — distinct from the seller.
    isRelatedTo: { "@type": "WebSite", "@id": `${origin}/#website`, name: siteConfig.name },
  };
}

/**
 * WebSite entity with a SearchAction pointing at the marketplace search box.
 * Rendered once in the root layout alongside the Organization block.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteConfig.name,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/marketplace?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
