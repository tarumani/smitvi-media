import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.join(process.cwd());

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "commondatastorage.googleapis.com" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "512mb",
    },
  },
};

export default nextConfig;
