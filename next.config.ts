import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const skipBasePath = process.env.SKIP_BASE_PATH === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: (isProd && !skipBasePath) ? '/bilstop2' : '', // Enable for GitHub Pages
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
