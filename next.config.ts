import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev requests coming from LAN IP (e.g. mobile testing)
  // Add any other dev origins you use, e.g. 'http://localhost:3000'
  experimental: {},
  devIndicators: {},
  allowedDevOrigins: ["https://192.168.1.188:3000", "http://localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "massagehome.com.vn",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
};

export default nextConfig;
