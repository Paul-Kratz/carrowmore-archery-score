import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/auth/**": ["./public/icons/icon-192.png"],
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [new URL("https://cdn.mos.cms.futurecdn.net/**")],
  },
};

export default nextConfig;
