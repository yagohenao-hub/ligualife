import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  allowedDevOrigins: [
    '192.168.1.37',
    '192.168.1.37:3000',
    '10.110.35.1',
    '10.110.35.1:3000',
    'localhost:3000',
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;
