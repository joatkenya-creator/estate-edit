import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Canonical-host redirect (Next 16 "proxy", formerly middleware).
 *
 * estateedit.org is the single canonical face of the site. Any request that
 * arrives on a non-canonical host — `www.estateedit.org` or the old
 * `*.workers.dev` URL — is permanently (308) redirected to the apex domain,
 * preserving the path and query string. This eliminates duplicate-content
 * across hosts so SEO/ranking consolidates on estateedit.org.
 *
 * Localhost and any other host (e.g. preview) are left untouched.
 */
const CANONICAL_HOST = "estateedit.org";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  const isNonCanonical =
    host === `www.${CANONICAL_HOST}` || host.endsWith(".workers.dev");

  if (isNonCanonical) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Run on page routes; skip Next internals, the metadata files, and assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|hero|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico)$).*)",
  ],
};
