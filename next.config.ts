import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Tailwind's CSS is small (~6 KB gzipped): inlined in the HTML, it no longer blocks the first
    // paint behind a stylesheet request.
    inlineCss: true,
  },
}

export default nextConfig
