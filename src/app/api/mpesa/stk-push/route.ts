import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateStkPush } from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // listing_payments has no client-write RLS policy (writes are system-owned),
  // so payment records go through the service-role admin client.
  const admin = createAdminClient();

  const body = await request.json() as { listingId: string; phone: string };
  const { listingId, phone } = body;

  if (!listingId || !phone) {
    return NextResponse.json({ error: "listingId and phone are required" }, { status: 400 });
  }

  // Fetch the listing to verify ownership and fee amount
  const { data: listing, error: listingError } = await supabase
    .from("user_listings")
    .select("id, title, listing_fee_amount, user_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const amount = Number(listing.listing_fee_amount ?? 500);

  // Create a pending payment record
  const { data: payment, error: paymentError } = await admin
    .from("listing_payments")
    .insert({
      listing_id: listingId,
      user_id: user.id,
      transaction_type: "listing_fee",
      amount,
      mpesa_phone: phone,
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 });
  }

  const result = await initiateStkPush({
    phone,
    amount,
    reference: payment.id.slice(0, 12),
    description: "Listing Fee",
  });

  if (!result.success) {
    // Mark payment failed
    await admin
      .from("listing_payments")
      .update({ status: "failed" })
      .eq("id", payment.id);

    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  // Store M-Pesa request IDs for callback matching
  await admin
    .from("listing_payments")
    .update({
      mpesa_checkout_request_id: result.checkoutRequestId,
      mpesa_merchant_request_id: result.merchantRequestId,
    })
    .eq("id", payment.id);

  return NextResponse.json({ paymentId: payment.id, message: "Check your phone for the M-Pesa prompt" });
}
