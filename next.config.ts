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
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.estateedit.org" }],
        destination: "https://estateedit.org/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "estate-edit.joatkenya120.workers.dev" }],
        destination: "https://estateedit.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

// Makes Cloudflare bindings available during `next dev` (no-op in production).
initOpenNextCloudflareForDev();
