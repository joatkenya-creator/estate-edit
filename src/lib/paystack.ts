import "server-only";

/**
 * Paystack server helpers. Only the SECRET key touches these — never the
 * browser. Used to verify a transaction before we activate a paid listing, so a
 * client can't fake a "paid" result.
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export type PaystackTx = {
  status: string; // "success" | "failed" | ...
  reference: string;
  amount: number; // in the currency's minor unit (cents)
  currency: string; // "KES" | "USD" | ...
  metadata?: Record<string, unknown> | null;
};

/** Verify a transaction by reference. Returns the tx data, or null if unverifiable. */
export async function verifyTransaction(reference: string): Promise<PaystackTx | null> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  const json = (await res.json()) as { status: boolean; data?: PaystackTx };
  return json.status && json.data ? json.data : null;
}
