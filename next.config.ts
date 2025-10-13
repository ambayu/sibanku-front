import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Abaikan semua error lint saat build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
