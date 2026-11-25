import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the development launcher from covering mobile navigation controls.
  devIndicators: false,
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
