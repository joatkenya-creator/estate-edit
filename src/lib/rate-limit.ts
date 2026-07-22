import "server-only";
import { getAppKv } from "@/lib/kv";

export type RateLimitResult = { allowed: boolean };

/**
 * Fixed-window rate limiter backed by Workers KV (binding: RATE_LIMIT_KV).
 * KV is eventually consistent, so under heavy concurrency a burst can slip
 * a few requests past the limit — that's an acceptable tradeoff for abuse
 * prevention (stopping sustained spam/harassment) rather than billing-grade
 * precision.
 *
 * Fails OPEN on any infra error (missing binding in local dev, KV outage,
 * etc.) — a rate limiter hiccup should never be able to take down checkout
 * or payment endpoints. This is intentionally the opposite tradeoff from
 * payment-webhook auth, which fails closed: here the worst case of "open" is
 * a temporary lapse in abuse protection, not a forged payment.
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  try {
    const kv = getAppKv();
    if (!kv) return { allowed: true };

    const windowStart = Math.floor(Date.now() / 1000 / opts.windowSeconds);
    const cacheKey = `rl:${key}:${windowStart}`;
    const current = Number((await kv.get(cacheKey)) ?? "0");

    if (current >= opts.limit) return { allowed: false };

    await kv.put(cacheKey, String(current + 1), { expirationTtl: opts.windowSeconds * 2 });
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

/** Best-effort client IP, from Cloudflare's connecting-IP header. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
