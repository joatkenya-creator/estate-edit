import "server-only";
import { getAppKv } from "@/lib/kv";

const FLUSH_INTERVAL_SECONDS = 60;

/**
 * Debounced view-count increment. A naive "UPDATE views = views + 1 per page
 * view" writes to the same row on every visit to a listing, which under
 * concurrent traffic on a popular listing becomes a write-contention hot spot
 * (flagged in the engineering audit). Instead, views accumulate in KV and are
 * flushed to Postgres at most once per listing per FLUSH_INTERVAL_SECONDS —
 * trading small, bounded under-counting (acceptable for a vanity metric) for
 * far fewer writes under load.
 *
 * `flush` is only called with the accumulated delta when this request is the
 * one that crosses the flush interval; every request in between just bumps
 * the KV counter.
 */
export async function recordViewDebounced(
  listingId: string,
  flush: (incrementBy: number) => Promise<void>,
): Promise<void> {
  try {
    const kv = getAppKv();
    if (!kv) {
      // No KV in this environment (e.g. local dev) — fall back to a direct write.
      await flush(1);
      return;
    }

    const bufferKey = `views-buf:${listingId}`;
    const flushKey = `views-flush:${listingId}`;

    const pending = Number((await kv.get(bufferKey)) ?? "0") + 1;
    const lastFlush = Number((await kv.get(flushKey)) ?? "0");
    const now = Date.now();

    if (now - lastFlush > FLUSH_INTERVAL_SECONDS * 1000) {
      await flush(pending);
      await Promise.all([
        kv.put(flushKey, String(now), { expirationTtl: FLUSH_INTERVAL_SECONDS * 10 }),
        kv.delete(bufferKey),
      ]);
    } else {
      await kv.put(bufferKey, String(pending), { expirationTtl: FLUSH_INTERVAL_SECONDS * 10 });
    }
  } catch {
    // Best-effort — a view count must never break the page render.
  }
}
