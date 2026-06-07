import type { NextConfig } from "next";
import path from "node:path";

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
};

export default nextConfig;
