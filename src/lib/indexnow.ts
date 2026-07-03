import "server-only";
import { SITE_URL } from "./seo";

/**
 * IndexNow key, proven by /public/<key>.txt containing this same value.
 * See https://www.indexnow.org/documentation.
 */
export const INDEXNOW_KEY = "4f6ecba33ff20bebc3ea01c061ef0eaa";

/** Push a batch of our own URLs to IndexNow (Bing, Yandex, and other participants). */
export async function submitToIndexNow(
  urls: string[],
): Promise<{ ok: boolean; status: number }> {
  if (urls.length === 0) return { ok: true, status: 200 };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });

  return { ok: res.ok, status: res.status };
}
