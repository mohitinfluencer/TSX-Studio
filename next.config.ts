import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@remotion/bundler", "@remotion/renderer", "ffmpeg-static"],
  async rewrites() {
    return [
      {
        // Use regex explicitly to match files starting with demo-output-
        source: '/exports/:slug(demo-output-.*)',
        destination: '/exports/sample.mp4',
      },
    ];
  },
};

export default nextConfig;
