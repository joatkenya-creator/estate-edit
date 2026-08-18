/**
 * Paystack public key, resolved on the SERVER at request time.
 *
 * `NEXT_PUBLIC_*` is inlined into the client bundle at BUILD time, so if the
 * build environment (CI) lacks it the browser gets `undefined` and every "Pay"
 * click dies with "payments not configured" — even though the Worker has the
 * key. Reading it server-side and passing it down as a prop makes a Worker
 * secret enough. The NEXT_PUBLIC_ name is still honoured as a fallback.
 */
export function paystackPublicKey(): string {
  return (
    process.env.PAYSTACK_PUBLIC_KEY ??
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ??
    ""
  );
}
