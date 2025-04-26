import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photos.zillowstatic.com',
        port: '', // Keep empty unless a specific port is needed
        pathname: '/**', // Allow any path under this hostname
      },
      // Add other domains here if needed in the future
    ],
  },
  /* config options here */
};

export default nextConfig;
