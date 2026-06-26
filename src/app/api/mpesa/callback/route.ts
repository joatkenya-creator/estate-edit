import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StkCallbackBody } from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  // Sender verification: the callback URL carries a secret token (set as part of
  // MPESA_CALLBACK_URL, e.g. .../api/mpesa/callback?token=XXX) that only our STK
  // push knows. Without this, anyone could POST a fake "paid" result and activate
  // a listing for free.
  const expectedToken = process.env.MPESA_CALLBACK_TOKEN;
  if (expectedToken) {
    const token = new URL(request.url).searchParams.get("token");
    if (token !== expectedToken) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    console.warn("MPESA_CALLBACK_TOKEN not set — callback is unauthenticated.");
  }

  let body: StkCallbackBody;

  try {
    body = await request.json() as StkCallbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const callback = body?.Body?.stkCallback;
  if (!callback) {
    return NextResponse.json({ error: "Invalid callback shape" }, { status: 400 });
  }

  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

  const supabase = createAdminClient();

  // Find the matching payment record
  const { data: payment } = await supabase
    .from("listing_payments")
    .select("id, listing_id")
    .eq("mpesa_checkout_request_id", CheckoutRequestID)
    .single();

  if (!payment) {
    // Unknown payment — still 200 so Safaricom doesn't retry
    return NextResponse.json({ ResultCode: 0 });
  }

  const succeeded = ResultCode === 0;
  const mpesaTransactionId = CallbackMetadata?.Item?.find(
    (i) => i.Name === "MpesaReceiptNumber",
  )?.Value;

  await supabase
    .from("listing_payments")
    .update({
      status: succeeded ? "completed" : "failed",
      mpesa_result_code: ResultCode,
      mpesa_result_desc: ResultDesc,
      mpesa_transaction_id: mpesaTransactionId ? String(mpesaTransactionId) : null,
      paid_at: succeeded ? new Date().toISOString() : null,
    })
    .eq("id", payment.id);

  // If paid → activate the listing
  if (succeeded && payment.listing_id) {
    await supabase
      .from("user_listings")
      .update({ status: "active", listing_fee_paid: true })
      .eq("id", payment.listing_id);
  }

  return NextResponse.json({ ResultCode: 0 });
}
