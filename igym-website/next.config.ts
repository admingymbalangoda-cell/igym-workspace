import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "https://igym-admin-system-krl71srsc-igym2.vercel.app/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
