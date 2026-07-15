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
    logo: OG_IMAGE,
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
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

/** Product schema for a user-posted marketplace listing (always priced). */
export function listingJsonLd(listing: {
  slug: string;
  title: string;
  description?: string | null;
  price: number | string;
  currency?: string | null;
  primary_image_url?: string | null;
  condition?: string | null;
}) {
  const listingOrigin = listing.currency === "USD" ? US_SITE_URL : SITE_URL;
  const url = `${listingOrigin}/marketplace/${listing.slug}`;
  const itemCondition = listing.condition?.includes("new")
    ? "https://schema.org/NewCondition"
    : "https://schema.org/UsedCondition";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description:
      listing.description ??
      `${listing.title} — available on The Estate Edit Marketplace. Enquire directly with the seller.`,
    image: [listing.primary_image_url ?? OG_IMAGE],
    itemCondition,
    offers: {
      "@type": "Offer",
      url,
      price: listing.price,
      priceCurrency: listing.currency || "KES",
      availability: "https://schema.org/InStock",
      priceValidUntil: oneYearFromNow(),
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };
}
