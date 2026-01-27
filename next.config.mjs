/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "@remotion/bundler", "@remotion/renderer", "ffmpeg-static"],
  // Disable rewrites temporarily to rule out path conflicts
  /*
  async rewrites() {
    return [
      {
        source: '/exports/:slug(demo-output-.*)',
        destination: '/exports/sample.mp4',
      },
    ];
  },
  */
};

export default nextConfig;
