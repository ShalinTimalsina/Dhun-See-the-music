import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@music/core', '@music/audio', '@music/content'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
