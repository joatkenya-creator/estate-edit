import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack";

/**
 * Verifies a Paystack listing-fee payment and activates the listing. The client
 * (Paystack popup) calls this on success with the transaction reference; we
 * confirm server-side against the SECRET key that the payment actually
 * succeeded for the correct amount + currency before publishing the listing.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { reference, listingId } = (await request.json()) as {
    reference?: string;
    listingId?: string;
  };
  if (!reference || !listingId) {
    return NextResponse.json({ error: "reference and listingId are required" }, { status: 400 });
  }

  // Ownership + the fee we expect (owner can read own listing under RLS).
  const { data: listing } = await supabase
    .from("user_listings")
    .select("id, user_id, listing_fee_amount, currency, listing_fee_paid")
    .eq("id", listingId)
    .single();

  if (!listing || listing.user_id !== user.id) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.listing_fee_paid) {
    return NextResponse.json({ ok: true, message: "Already paid" });
  }

  const tx = await verifyTransaction(reference);
  const expectedMinor = Math.round(Number(listing.listing_fee_amount ?? 0) * 100);
  const currencyOk =
    (tx?.currency ?? "").toUpperCase() === (listing.currency ?? "").toUpperCase();

  if (!tx || tx.status !== "success" || tx.amount < expectedMinor || !currencyOk) {
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 402 });
  }

  // Privileged writes: listing_payments has no client-write RLS policy.
  const admin = createAdminClient();

  await admin.from("listing_payments").insert({
    listing_id: listing.id,
    user_id: user.id,
    transaction_type: "listing_fee",
    amount: Number(listing.listing_fee_amount ?? 0),
    currency: listing.currency,
    status: "completed",
    paid_at: new Date().toISOString(),
    metadata: { provider: "paystack", reference: tx.reference },
  });

  await admin
    .from("user_listings")
    // Fee paid, but still run the moderation checklist: send to pending_review
    // so the ee-moderate-listings cron clears/approves it (like free listings).
    .update({ status: "pending_review", listing_fee_paid: true })
    .eq("id", listing.id);

  return NextResponse.json({ ok: true });
}
