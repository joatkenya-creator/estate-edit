import type { NextConfig } from "next";
import path from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles higher up
  // the directory tree (e.g. one in the user's home folder).
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      // Supabase Storage (asset-images bucket) — the client's own photography.
      {
        protocol: "https",
        hostname: "czvrsproxqlpcnvbaltq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Interim luxury stock imagery until real photos are uploaded.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Canonical-host redirects. estateedit.org is the single SEO face of the
  // site; any request on www or the old *.workers.dev URL is permanently (308)
  // redirected to the apex, preserving path + query. Done here (not in a
  // proxy/middleware) because Next 16 proxy runs on the Node runtime, which
  // OpenNext/Cloudflare does not support — redirects() run at the routing layer
  // and work on Cloudflare.
  async redirects() {
    // One root rule + one `:path+` (one-or-more) rule per non-canonical host.
    // NOTE: a single `/:path*` rule does NOT substitute correctly for the empty
    // root path — it emits a literal "/:path*" Location that 404s. Splitting the
    // root out and using `:path+` for the rest avoids that.
    const nonCanonicalHosts = [
      "www.estateedit.org",
      "estate-edit.joatkenya120.workers.dev",
    ];
    return nonCanonicalHosts.flatMap((host) => [
      {
        source: "/",
        has: [{ type: "host" as const, value: host }],
        destination: "https://estateedit.org/",
        permanent: true,
      },
      {
        source: "/:path+",
        has: [{ type: "host" as const, value: host }],
        destination: "https://estateedit.org/:path+",
        permanent: true,
      },
    ]);
  },
  async headers() {
    // Verified against a local production build (`npm run build && next start`,
    // which activates the same production-only scripts as the live site) across
    // home/collection/marketplace/checkout/login: every script/style/img/connect
    // source actually requested matches this list, and product images either
    // proxy same-origin through next/image or hit the one Supabase host below.
    // The one thing NOT exercised end-to-end is Paystack's inline-widget iframe
    // (frame-src) — that only opens mid-transaction on the seller listing-fee
    // flow, which needs a real payment to trigger. If that popup ever fails to
    // open after a deploy, it's almost certainly this list missing Paystack's
    // current iframe host — check the console and add it here.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.paystack.co https://connect.facebook.net https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://czvrsproxqlpcnvbaltq.supabase.co https://images.unsplash.com https://www.facebook.com https://www.googletagmanager.com",
      "font-src 'self' data:",
      "connect-src 'self' https://czvrsproxqlpcnvbaltq.supabase.co https://api.paystack.co https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com",
      "frame-src https://checkout.paystack.com https://js.paystack.co https://standard.paystack.co",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Makes Cloudflare bindings available during `next dev` (no-op in production).
initOpenNextCloudflareForDev();
