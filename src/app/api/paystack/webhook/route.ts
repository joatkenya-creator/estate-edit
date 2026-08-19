import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "@/lib/timing-safe";
import type { Json } from "@/lib/supabase/database.types";

/**
 * Paystack webhook — server-to-server "payment succeeded" notification. This is
 * the reliable path: even if the shopper closes the tab before the browser
 * callback runs, Paystack calls this and we activate the listing. Idempotent
 * (skips if already paid), and only trusts requests whose HMAC-SHA512 signature
 * matches our secret key.
 */

export const dynamic = "force-dynamic";

async function hmacSha512Hex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type Charge = {
  reference?: string;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: { listingId?: string } | null;
};

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = await hmacSha512Hex(secret, raw);
  if (!timingSafeEqual(signature, expected)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: Charge };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Only act on a successful charge; ack everything else so Paystack stops retrying.
  const data = event.data;
  if (event.event !== "charge.success" || data?.status !== "success") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  // A successful charge we can't apply is money taken with nothing delivered.
  // Record it instead of dropping it, so it shows up in a query rather than
  // only in the Paystack dashboard. Upsert: webhook retries update one row.
  async function flagUnmatched(reason: string) {
    await admin.from("unmatched_payments").upsert(
      {
        reference: data!.reference ?? "unknown",
        amount: (data!.amount ?? 0) / 100,
        currency: data!.currency ?? null,
        listing_id: data!.metadata?.listingId ?? null,
        reason,
        payload: data as unknown as Json,
      },
      { onConflict: "reference" },
    );
    return NextResponse.json({ received: true });
  }

  const listingId = data.metadata?.listingId;
  if (!listingId) return flagUnmatched("no_listing_id");

  const { data: listing } = await admin
    .from("user_listings")
    .select("id, user_id, listing_fee_amount, currency, listing_fee_paid")
    .eq("id", listingId)
    .single();

  if (!listing) return flagUnmatched("listing_not_found");
  // Already activated (e.g. the browser callback beat us here) — not a drop.
  if (listing.listing_fee_paid) return NextResponse.json({ received: true });

  const expectedMinor = Math.round(Number(listing.listing_fee_amount ?? 0) * 100);
  const amountOk = (data.amount ?? 0) >= expectedMinor;
  const currencyOk = (data.currency ?? "").toUpperCase() === (listing.currency ?? "").toUpperCase();
  if (!amountOk) return flagUnmatched("amount_short");
  if (!currencyOk) return flagUnmatched("currency_mismatch");

  await admin.from("listing_payments").insert({
    listing_id: listing.id,
    user_id: listing.user_id,
    transaction_type: "listing_fee",
    amount: Number(listing.listing_fee_amount ?? 0),
    currency: listing.currency,
    status: "completed",
    paid_at: new Date().toISOString(),
    metadata: { provider: "paystack", reference: data.reference, via: "webhook" },
  });

  await admin
    .from("user_listings")
    // Fee paid, but still run the moderation checklist: send to pending_review
    // so the ee-moderate-listings cron clears/approves it (like free listings).
    .update({ status: "pending_review", listing_fee_paid: true })
    .eq("id", listing.id);

  return NextResponse.json({ received: true });
}
