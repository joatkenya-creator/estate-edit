import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Persistent ISR cache is optional. To enable it, create an R2 bucket (see
// wrangler.jsonc), then add:
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   incrementalCache: r2IncrementalCache,
export default defineCloudflareConfig({});
