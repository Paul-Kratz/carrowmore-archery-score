import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [new URL("https://cdn.mos.cms.futurecdn.net/**")],
  },
};

export default nextConfig;
