import "server-only";
import { headers } from "next/headers";
import { regionFromCountry, type Region } from "./region";

/**
 * Resolve the active region for the current request purely from the visitor's
 * location: Cloudflare's `cf-ipcountry` geo header (KE -> Kenya, everyone else
 * -> Virginia). There is NO manual override — a visitor cannot switch markets,
 * so Kenyan traffic only ever sees the Kenya store and US / other traffic only
 * the Virginia store. Falls back to Virginia when geo is unavailable.
 */
export async function getRegion(): Promise<Region> {
  const country = (await headers()).get("cf-ipcountry");
  return regionFromCountry(country);
}
