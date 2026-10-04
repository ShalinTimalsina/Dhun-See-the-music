import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@music/core', '@music/audio', '@music/content'],
};

export default nextConfig;
