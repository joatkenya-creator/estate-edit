import "server-only";
import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { regionFromCountry, type Region } from "./region";

/**
 * Detect the visitor's ISO country. Cloudflare's request `cf` object is the
 * most reliable source on Workers; the `cf-ipcountry` header is a fallback.
 * Returns null in local dev / build (no request geo).
 */
async function detectCountry(): Promise<string | null> {
  try {
    const { cf } = await getCloudflareContext({ async: true });
    const country = (cf as { country?: string } | undefined)?.country;
    if (country) return country;
  } catch {
    /* not in the Cloudflare runtime (local dev / build) */
  }
  try {
    return (await headers()).get("cf-ipcountry");
  } catch {
    return null;
  }
}

/**
 * Resolve the active region purely from the visitor's location (KE -> Kenya,
 * everyone else -> Virginia). There is NO manual override — a visitor cannot
 * switch markets, so Kenyan traffic only ever sees the Kenya store and US /
 * other traffic only the Virginia store. Defaults to Virginia when geo is
 * unavailable.
 */
export async function getRegion(): Promise<Region> {
  return regionFromCountry(await detectCountry());
}
