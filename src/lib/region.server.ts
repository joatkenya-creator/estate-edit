import "server-only";
import { cookies, headers } from "next/headers";
import { REGION_COOKIE, isRegion, regionFromCountry, type Region } from "./region";

/**
 * Resolve the active region for the current request (server components + data
 * layer). Priority:
 *   1. the `ee_region` cookie (the visitor's explicit choice via the switcher)
 *   2. Cloudflare's `cf-ipcountry` geo header (KE -> Kenya, else Virginia)
 *   3. Virginia (default for unknown / no geo)
 */
export async function getRegion(): Promise<Region> {
  const cookieStore = await cookies();
  const chosen = cookieStore.get(REGION_COOKIE)?.value;
  if (isRegion(chosen)) return chosen;

  const country = (await headers()).get("cf-ipcountry");
  return regionFromCountry(country);
}
