import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  serverExternalPackages: ['@opentelemetry/sdk-node'],
};

export default nextConfig;
