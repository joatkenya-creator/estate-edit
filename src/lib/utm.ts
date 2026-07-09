/**
 * First-touch attribution. Captures utm_* (and referrer) into a cookie on the
 * first visit, then getUtm() returns it so every lead (subscriber / order /
 * inquiry) records which channel actually brought the buyer. Client-only.
 */

const UTM_COOKIE = "ee_utm";
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export function captureUtm(): void {
  if (typeof document === "undefined") return;
  // First-touch: keep the original source, don't overwrite on later visits.
  if (document.cookie.includes(`${UTM_COOKIE}=`)) return;

  const params = new URLSearchParams(window.location.search);
  const data: Record<string, string> = {};
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) data[k] = v.slice(0, 120);
  }
  if (!data.utm_source && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      if (host && !host.includes(window.location.host)) data.referrer = host;
    } catch {
      /* ignore */
    }
  }
  if (Object.keys(data).length === 0) return;

  document.cookie = `${UTM_COOKIE}=${encodeURIComponent(JSON.stringify(data))};path=/;max-age=${
    60 * 60 * 24 * 90
  };samesite=lax`;
}

export function getUtm(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const m = document.cookie.match(new RegExp(`${UTM_COOKIE}=([^;]+)`));
  if (!m) return {};
  try {
    return JSON.parse(decodeURIComponent(m[1])) as Record<string, string>;
  } catch {
    return {};
  }
}
