import "server-only";
import { headers } from "next/headers";
import { getAppKv } from "@/lib/kv";

const FLUSH_INTERVAL_SECONDS = 60;

/**
 * Requests that are not a person looking at the listing: search-engine and SEO
 * crawlers, link-preview fetchers (a WhatsApp share generates one of these per
 * share, not per reader), uptime monitors, and scripted clients.
 *
 * The number on a listing is shown to its seller as "how many people looked at
 * my item". Counting Googlebot in it would inflate it exactly when a listing
 * starts ranking, which is the moment the figure needs to be trustworthy.
 */
const BOT_USER_AGENT =
  /bot\b|bot\/|crawler|crawling|spider|slurp|facebookexternalhit|whatsapp|telegram|skypeuripreview|twitterbot|linkedinbot|pinterest|redditbot|embedly|quora link preview|bingpreview|applebot|yandex|duckduck|baiduspider|semrush|ahrefs|mj12|dotbot|petalbot|screaming frog|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|headlesschrome|phantomjs|python-requests|curl\/|wget\/|go-http-client|node-fetch|axios\//i;

/** Is this request a crawler / preview fetcher rather than a human visitor? */
export async function isBotRequest(): Promise<boolean> {
  try {
    const ua = (await headers()).get("user-agent")?.trim() ?? "";
    // No user-agent at all is a script, not a browser.
    return ua === "" || BOT_USER_AGENT.test(ua);
  } catch {
    // No request scope (build/prerender) — definitely not a human page view.
    return true;
  }
}

/**
 * Debounced view-count increment. Every human page load counts, but the writes
 * are batched: a naive "UPDATE views = views + 1 per page view" writes to the
 * same row on every visit, which under concurrent traffic on a popular listing
 * becomes a write-contention hot spot (flagged in the engineering audit).
 * Instead views accumulate in KV and are flushed to Postgres at most once per
 * listing per FLUSH_INTERVAL_SECONDS.
 *
 * Nothing is dropped: the buffer holds the pending count and the whole
 * accumulated delta is passed to `flush` when the interval elapses, so N clicks
 * in a minute still add N. The only cost is that the number can be up to a
 * minute behind.
 *
 * `flush` must apply the delta ATOMICALLY in the database (see
 * `increment_listing_views` in supabase/listing-views.sql). Doing it as
 * read-then-write in the app loses concurrent views.
 */
export async function recordViewDebounced(
  listingId: string,
  flush: (incrementBy: number) => Promise<void>,
): Promise<void> {
  try {
    if (await isBotRequest()) return;

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
