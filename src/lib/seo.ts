/**
 * SEO constants + JSON-LD (schema.org) builders for The Estate Edit.
 *
 * The business operates from Nairobi, Kenya and additionally TARGETS the
 * Virginia (USA) market — it has no physical presence there, so Virginia is
 * modelled as an `areaServed`, not an address/location.
 */
import { siteConfig, type AssetDetail } from "./site";

/** Canonical production origin. Keep in sync with metadataBase in layout.tsx. */
export const SITE_URL = "https://estateedit.org";

/** Default social/share image (absolute). */
export const OG_IMAGE = `${SITE_URL}/hero/estate.jpg`;

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

/** Product schema for an individual catalogue asset. */
export function assetJsonLd(asset: AssetDetail) {
  const url = `${SITE_URL}/collection/${asset.slug}`;
  const image = asset.images[0]?.url ?? asset.imageUrl ?? OG_IMAGE;

  const hasPrice = asset.price != null && !asset.priceOnRequest;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: asset.title,
    description: asset.description ?? `${asset.category} available through ${siteConfig.name}.`,
    image: [image],
    category: asset.category,
    ...(asset.brand ? { brand: { "@type": "Brand", name: asset.brand } } : {}),
    offers: {
      "@type": "Offer",
      url,
      availability: AVAILABILITY[asset.status],
      ...(hasPrice
        ? { price: asset.price, priceCurrency: asset.currency }
        : {}),
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}
