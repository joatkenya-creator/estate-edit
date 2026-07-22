"use server";

import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createPublicClient } from "@/lib/supabase/public";
import { getDeliverySettings } from "@/lib/queries";
import { notifyCustomer, sendStaffOrderAlert } from "@/lib/order-notifications";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { Json } from "@/lib/supabase/database.types";
import type { CartItem } from "@/lib/site";

/**
 * Authoritative order placement. The cart only tells us WHAT the shopper
 * wants (slug + quantity) — price, currency, delivery tier and fragility are
 * always re-read from the published `assets` catalogue here, and the
 * subtotal/delivery fee/total are recomputed from those authoritative values.
 * A tampered client (or a direct POST to the Supabase REST endpoint) can no
 * longer dictate what an order is recorded as costing.
 */

export type PlaceOrderInput = {
  fullName: string;
  phone: string;
  email?: string;
  market: "kenya" | "virginia";
  county: string;
  town?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  address: string;
  deliveryNotes?: string;
  deliveryQuotePending?: boolean;
  items: { slug: string; quantity: number }[];
  source?: string;
};

export type PlacedOrder = {
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
};

/** EE-XXXXXX — mirrors the CMS hook's format so both creation paths match. */
function createOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `EE-${t}${r}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  // Unauthenticated endpoint (anyone can check out) — cap orders per IP so it
  // can't be scripted to flood the store with fake orders or notification sends.
  const ip = getClientIp(await headers());
  const limit = await rateLimit(`place-order:${ip}`, { limit: 8, windowSeconds: 3600 });
  if (!limit.allowed) {
    throw new Error("Too many orders placed from this connection. Please try again in a while, or contact us directly.");
  }

  const quantities = new Map<string, number>();
  for (const it of input.items) {
    if (!it.slug || !Number.isFinite(it.quantity) || it.quantity < 1) continue;
    quantities.set(it.slug, (quantities.get(it.slug) ?? 0) + Math.floor(it.quantity));
  }
  const slugs = [...quantities.keys()];
  if (!slugs.length) throw new Error("Your cart is empty.");

  const supabase = createPublicClient();

  // Authoritative catalogue read — only published, currently purchasable
  // items can be ordered, and their price/tier/fragility come from here,
  // never from the client.
  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("slug, title, price, price_max, currency, price_on_request, status, delivery_tier, fragile, primary_image_url")
    .in("slug", slugs)
    .eq("_status", "published");

  if (assetsError) throw new Error(assetsError.message);

  const found = new Map((assets ?? []).map((a) => [a.slug, a]));
  const missing = slugs.filter((s) => !found.has(s));
  if (missing.length) {
    throw new Error("One or more items in your cart are no longer available. Please refresh your cart.");
  }

  const currency = assets?.[0]?.currency ?? "KES";
  const items: CartItem[] = [];

  for (const slug of slugs) {
    const a = found.get(slug)!;
    const quantity = quantities.get(slug)!;

    const hasRange = typeof a.price_max === "number" && a.price_max > (a.price ?? 0);
    const purchasable =
      !a.price_on_request && !hasRange && typeof a.price === "number" && a.price > 0 && a.status !== "sold";
    if (!purchasable) {
      throw new Error(`"${a.title}" is no longer available for checkout. Please refresh your cart.`);
    }

    items.push({
      slug: a.slug ?? slug,
      title: a.title ?? "",
      price: a.price!,
      currency: a.currency ?? currency,
      quantity,
      imageUrl: a.primary_image_url ?? undefined,
      deliveryTier: a.delivery_tier ?? undefined,
      fragile: a.fragile ?? undefined,
    });
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  // Authoritative delivery fee — same "base + largest handling add-on" rule
  // as the live quote, computed from the DB-verified tiers above.
  const settings = await getDeliverySettings();
  let deliveryFee = 0;
  if (input.deliveryQuotePending) {
    deliveryFee = 0; // Quoted manually after order (Virginia "outside area" case).
  } else if (settings.enabled && !(settings.freeAbove != null && subtotal >= settings.freeAbove)) {
    const base =
      (input.county && settings.countyRates[input.county] != null
        ? settings.countyRates[input.county]
        : settings.flatFee) || 0;
    const handling = items.reduce((max, it) => {
      const tier = it.deliveryTier ?? "standard";
      const h = (settings.tierSurcharges[tier] ?? 0) + (it.fragile ? settings.fragileSurcharge : 0);
      return Math.max(max, h);
    }, 0);
    deliveryFee = base + handling;
  }

  const total = subtotal + deliveryFee;
  const orderNumber = createOrderNumber();

  const { error } = await supabase.from("orders").insert({
    order_number: orderNumber,
    status: "pending",
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    market: input.market,
    county: input.county || null,
    town: input.town?.trim() || null,
    state: input.state?.trim() || null,
    postal_code: input.postalCode?.trim() || null,
    country: input.country || (input.market === "virginia" ? "US" : "KE"),
    address: input.address?.trim() || null,
    delivery_notes: input.deliveryNotes?.trim() || null,
    delivery_quote_pending: input.deliveryQuotePending ?? false,
    items: items as unknown as Json,
    subtotal,
    delivery_fee: deliveryFee,
    total,
    currency,
    payment_status: "unpaid",
    source: input.source || "checkout",
  });

  if (error) throw new Error(error.message);

  // Fire-and-forget notifications — never block or fail the order itself.
  const { ctx } = getCloudflareContext();
  const notify = async () => {
    await Promise.allSettled([
      notifyCustomer({
        event: "placed",
        orderNumber,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        total,
        currency,
        items,
        subtotal,
        deliveryFee,
      }),
      sendStaffOrderAlert({
        orderNumber,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        county: input.county,
        town: input.town,
        state: input.state,
        postalCode: input.postalCode,
        address: input.address,
        market: input.market,
        deliveryQuotePending: input.deliveryQuotePending,
        items,
        subtotal,
        deliveryFee,
        total,
        currency,
      }),
    ]);
  };
  ctx.waitUntil(notify().catch(() => {}));

  return { orderNumber, subtotal, deliveryFee, total, currency };
}
