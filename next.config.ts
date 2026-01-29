import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/lifetime100',
        destination: '/lifetime100.html',
      },
      {
        source: '/terms',
        destination: '/terms.html',
      },
      {
        source: '/privacy',
        destination: '/privacy.html',
      },
    ];
  },
};

export default nextConfig;
