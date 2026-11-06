import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL?.replace(/\/+$/, "");

    if (!apiUrl) {
      throw new Error("Defina API_URL no arquivo .env.local para conectar ao backend.");
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
