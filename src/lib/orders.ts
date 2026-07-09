import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/lib/supabase/database.types";
import type { CartItem } from "@/lib/site";
import { getUtm } from "@/lib/utm";

/**
 * Client-safe order placement. The shopper's browser inserts the order with the
 * anon key (RLS allows INSERT-only on `orders`). There is no online payment —
 * the order lands as `pending` and is paid after delivery, then reconciled in
 * the CMS payments ledger. Because anon cannot read orders back, the
 * confirmation screen is rendered from the data we submit here (esp. the
 * order number we generate client-side).
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
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  source?: string;
};

export type PlacedOrder = { orderNumber: string };

/** EE-XXXXXX — mirrors the CMS hook's format so both creation paths match. */
export function createOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `EE-${t}${r}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  const supabase = createPublicClient();
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
    items: input.items as unknown as Json,
    subtotal: input.subtotal,
    delivery_fee: input.deliveryFee,
    total: input.total,
    currency: input.currency,
    payment_status: "unpaid",
    source: input.source || "checkout",
    metadata: ((u) => (Object.keys(u).length ? (u as unknown as Json) : null))(getUtm()),
  });

  if (error) throw new Error(error.message);

  // Fire-and-forget staff alert. `keepalive` lets it complete through the
  // redirect to the confirmation page; any failure must not block the order.
  try {
    void fetch("/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        orderNumber,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        market: input.market,
        county: input.county,
        town: input.town,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        address: input.address,
        deliveryQuotePending: input.deliveryQuotePending,
        items: input.items,
        subtotal: input.subtotal,
        deliveryFee: input.deliveryFee,
        total: input.total,
        currency: input.currency,
      }),
    }).catch(() => {});
  } catch {
    /* notification is best-effort */
  }

  return { orderNumber };
}
