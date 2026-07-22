import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AppKv = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

/**
 * The shared Workers KV namespace (binding: RATE_LIMIT_KV) — despite the name,
 * it's used for any small, best-effort counter/coordination need (rate
 * limiting, view-count debouncing), not rate limiting exclusively. Returns
 * undefined if the binding isn't present (e.g. local `next dev` without a
 * Cloudflare preview), so callers should treat that as "feature unavailable,
 * don't block the request" rather than an error.
 */
export function getAppKv(): AppKv | undefined {
  try {
    const { env } = getCloudflareContext();
    return (env as Record<string, unknown>).RATE_LIMIT_KV as AppKv | undefined;
  } catch {
    return undefined;
  }
}
