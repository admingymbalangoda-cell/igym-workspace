import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
