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
        source: '/update-family',
        destination: '/auth/update-family',
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
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
