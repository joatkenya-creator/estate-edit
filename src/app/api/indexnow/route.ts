import sitemap from "@/app/sitemap";
import { submitToIndexNow } from "@/lib/indexnow";

/**
 * Re-submits every URL currently in the sitemap to IndexNow (Bing, Yandex,
 * and other participants), so new/changed pages get picked up without
 * waiting on the next crawl. Trigger manually after a bulk content change —
 * e.g. `curl -X POST https://estateedit.org/api/indexnow -H "x-indexnow-secret: $INDEXNOW_SECRET"`
 * — or wire it into the CMS publish webhook later. Guarded by a shared
 * secret (set via `wrangler secret put INDEXNOW_SECRET`) so it can't be hit
 * by randoms to burn our submission quota.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const secret = request.headers.get("x-indexnow-secret");
  if (!secret || secret !== process.env.INDEXNOW_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await sitemap();
  const urls = entries.map((e) => e.url);
  const result = await submitToIndexNow(urls);

  return Response.json({ submitted: urls.length, ...result });
}
