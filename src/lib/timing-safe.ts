/**
 * Constant-time string compare — avoids leaking a secret/signature one byte
 * at a time via response-time timing differences. Length is compared first
 * (unavoidable without padding to a fixed size), then every character is
 * XOR'd regardless of an early mismatch.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
