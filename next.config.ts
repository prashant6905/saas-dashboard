import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type checking is enforced via dedicated strict `npm run type-check`
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
