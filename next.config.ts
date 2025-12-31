import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL("https://cdn.mos.cms.futurecdn.net/**")],
  },
};

export default nextConfig;
