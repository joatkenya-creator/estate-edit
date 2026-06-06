import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles higher up
  // the directory tree (e.g. one in the user's home folder).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
