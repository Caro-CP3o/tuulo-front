import type { NextConfig } from "next";

// ---------------------------
// URLS REWRITE
// ---------------------------
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/create-family',
        destination: '/auth/create-family',
      },
      {
        source: '/home',
        destination: '/auth/home-family',
      },
      {
        source: '/profile',
        destination: '/auth/profile-update',
      },
      {
        source: '/update-family/:familyId',
        destination: '/auth/update-family/:familyId',
      },
      {
        source: '/settings',
        destination: '/auth/settings',
      },
      {
        source: '/verified',
        destination: '/auth/verified-email',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.tuulo.be',
     
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
