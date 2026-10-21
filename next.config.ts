import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Registrations send the student ID (5 MB max) through a Server Action; the default cap is 1 MB.
    serverActions: { bodySizeLimit: "6mb" },
  },
}

export default nextConfig
