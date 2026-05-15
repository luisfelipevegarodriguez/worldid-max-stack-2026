/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@worldcoin/idkit'],
  },
  images: {
    domains: ['worldcoin.org', 'world.org'],
  },
};

export default nextConfig;
