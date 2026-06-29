/**
 * Region / market model for the dual-market storefront. Client-safe (no
 * next/headers): pure types + constants shared by server and client. The
 * server-only resolver lives in `region.server.ts`.
 *
 * Each region is a self-contained storefront with native pricing:
 *   - kenya    -> KES, Kenya counties delivery
 *   - virginia -> USD, Virginia localities delivery (USA)
 */
export type Region = "kenya" | "virginia";

export const REGIONS: Region[] = ["kenya", "virginia"];

/** Cookie that pins a visitor's chosen region (overrides geo detection). */
export const REGION_COOKIE = "ee_region";

export const regionCurrency: Record<Region, "KES" | "USD"> = {
  kenya: "KES",
  virginia: "USD",
};

export const regionLabel: Record<Region, string> = {
  kenya: "Kenya",
  virginia: "Virginia (USA)",
};

/** Short toggle label, e.g. for the header switcher. */
export const regionShort: Record<Region, string> = {
  kenya: "KE",
  virginia: "US",
};

export const regionFlag: Record<Region, string> = {
  kenya: "🇰🇪",
  virginia: "🇺🇸",
};

/** Brand sub-line shown under the wordmark. */
export const regionTagline: Record<Region, string> = {
  kenya: "Kenya · East Africa",
  virginia: "Virginia · USA",
};

export function isRegion(value: unknown): value is Region {
  return value === "kenya" || value === "virginia";
}

/**
 * Map a visitor's ISO country to a default region. Only Kenyan (KE) traffic
 * defaults to the Kenya store; US and everyone else (and unknown / no geo)
 * default to Virginia. A visitor can still switch markets (the ee_region
 * cookie overrides this).
 */
export function regionFromCountry(country?: string | null): Region {
  return country?.toUpperCase() === "KE" ? "kenya" : "virginia";
}
