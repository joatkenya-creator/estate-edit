import "server-only";
import { headers } from "next/headers";
import { type Region } from "./region";

/**
 * Resolve the active market from the request HOST, so each region has its own
 * crawlable URL (this is what lets BOTH markets rank — see [[region.ts]]):
 *   - us.estateedit.org  -> Virginia (USD store)
 *   - estateedit.org     -> Kenya (primary / default), and anything else
 *
 * Host-based (not geo-IP) is deliberate: a US-based crawler hitting the apex
 * must see the Kenya store, and the Virginia store lives at a distinct URL that
 * crawlers can index independently. hreflang links the two.
 */
export async function getRegion(): Promise<Region> {
  try {
    const host = ((await headers()).get("host") ?? "").toLowerCase();
    return host.startsWith("us.") ? "virginia" : "kenya";
  } catch {
    // Build / non-request context — default to the primary market.
    return "kenya";
  }
}
