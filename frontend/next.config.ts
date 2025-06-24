import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ensure consistent asset prefix for static exports
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  // Disable server-side features that don't work with static export
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
