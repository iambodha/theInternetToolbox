import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages deployment configuration
  basePath: process.env.GITHUB_ACTIONS ? '/theInternetToolbox' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/theInternetToolbox/' : '',
};

export default nextConfig;
