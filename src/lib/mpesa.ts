/**
 * Safaricom Daraja M-Pesa API integration
 * Handles STK Push (Lipa na M-Pesa) for listing fees
 */

const DARAJA_BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

type DarajaToken = { access_token: string; expires_in: string };

export async function getDarajaToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Daraja token fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as DarajaToken;
  return data.access_token;
}

export type StkPushResult = {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  error?: string;
};

export async function initiateStkPush({
  phone,
  amount,
  reference,
  description,
}: {
  phone: string;
  amount: number;
  reference: string;
  description: string;
}): Promise<StkPushResult> {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const callbackUrl = process.env.MPESA_CALLBACK_URL!;

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  // Normalise Kenyan phone to 2547XXXXXXXX
  const normalised = normalisePhone(phone);
  if (!normalised) {
    return { success: false, error: "Invalid phone number format" };
  }

  try {
    const token = await getDarajaToken();

    const res = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(amount),
        PartyA: normalised,
        PartyB: shortcode,
        PhoneNumber: normalised,
        CallBackURL: callbackUrl,
        AccountReference: reference.slice(0, 12),
        TransactionDesc: description.slice(0, 13),
      }),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok || data.ResponseCode !== "0") {
      return {
        success: false,
        error: String(data.ResponseDescription ?? data.errorMessage ?? "STK push failed"),
      };
    }

    return {
      success: true,
      checkoutRequestId: String(data.CheckoutRequestID ?? ""),
      merchantRequestId: String(data.MerchantRequestID ?? ""),
    };
  } catch (err) {
    console.error("STK push error:", err);
    return { success: false, error: "Failed to initiate M-Pesa payment" };
  }
}

export type StkCallbackBody = {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
};

function normalisePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  if (digits.startsWith("1") && digits.length === 9) return `254${digits}`;
  return null;
}
