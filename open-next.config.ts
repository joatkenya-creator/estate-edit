import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

// Without an incrementalCache OpenNext uses "dummy", which silently turns every
// unstable_cache() in src/lib/queries.ts into a no-op — each item page was
// paying an uncached Supabase round trip (~450ms TTFB) on every request.
//
// This keeps entries in the Cloudflare Cache API (per data centre, free, no
// write quota) for each entry's own `revalidate` window. There is no tag cache,
// so revalidateTag() doesn't purge early: listings can be up to 60s stale.
//
// ponytail: Cache-API-only, no persistent store, because R2 isn't enabled on
// the account. Once it is, replace `noStore` with r2IncrementalCache (and add
// the R2 binding in wrangler.jsonc) for a cross-colo shared cache.
const noStore = {
  name: "cache-api-only",
  get: async () => null,
  set: async () => {},
  delete: async () => {},
};

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(noStore, { mode: "long-lived" }),
});
