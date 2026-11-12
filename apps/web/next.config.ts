import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@worldid/shared'],
  serverExternalPackages: ['@prisma/client', '@prisma/engines', '@prisma/adapter-pg', 'pg'],
  // Lint is a separate `pnpm lint` step so a warning cannot fail the production build.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'worldcoin.org' },
      { protocol: 'https', hostname: 'world.org' },
    ],
  },
};

export default nextConfig;
