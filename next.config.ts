import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
    ];
  },
};



export default nextConfig;
