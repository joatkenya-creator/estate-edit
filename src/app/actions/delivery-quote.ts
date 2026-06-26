"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { getDeliverySettings } from "@/lib/queries";

/**
 * Authoritative delivery quote. Recomputes the fee on the server from the
 * CURRENT product tiers (by slug) + live delivery settings, instead of trusting
 * the client cart snapshot — so a stale cart can't hide or mis-price the
 * size/fragile surcharge. Mirrors computeDeliveryFee's "base + largest item" rule.
 */
export async function quoteDelivery(
  slugs: string[],
  county: string,
  subtotal: number,
): Promise<number> {
  const settings = await getDeliverySettings();
  if (!settings.enabled) return 0;
  if (settings.freeAbove != null && subtotal >= settings.freeAbove) return 0;

  const base =
    (county && settings.countyRates[county] != null
      ? settings.countyRates[county]
      : settings.flatFee) || 0;

  if (!slugs.length) return base;

  let handling = 0;
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("assets")
      .select("slug, delivery_tier, fragile")
      .in("slug", slugs)
      .eq("_status", "published");

    for (const a of data ?? []) {
      const tier = a.delivery_tier ?? "standard";
      const h =
        (settings.tierSurcharges[tier] ?? 0) + (a.fragile ? settings.fragileSurcharge : 0);
      if (h > handling) handling = h;
    }
  } catch {
    // On a read failure, fall back to the base fee only.
  }

  return base + handling;
}
