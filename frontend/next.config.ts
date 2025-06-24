import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Add base path and asset prefix for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/theInternetToolbox' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/theInternetToolbox/' : '',
};

export default nextConfig;
