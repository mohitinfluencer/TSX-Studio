/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["@prisma/client", "@remotion/bundler", "@remotion/renderer", "ffmpeg-static"],
    output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
};



module.exports = nextConfig;
