import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel creates its own deployment output. In Next.js 16.3, combining its
  // build adapter with standalone output omits a trace that standalone expects.
  output: process.env.VERCEL ? undefined : "standalone",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
