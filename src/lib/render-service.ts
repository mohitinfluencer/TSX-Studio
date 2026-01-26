import path from "path";
import fs from "fs/promises";
import os from "os";
import { db } from "@/lib/db";


const PUBLIC_EXPORTS_DIR = path.join(process.cwd(), "public", "exports");

interface RenderConfig {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
}

export async function renderProject(
    jobId: string,
    userCode: string,
    config: RenderConfig
) {
    // Dynamic imports to prevent route loading crashes
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, selectComposition } = await import("@remotion/renderer");
    const ffmpegModule = await import("ffmpeg-static");
    const ffmpeg = ffmpegModule.default;
    const ffprobeModule = await import("ffprobe-static");
    const ffprobe = ffprobeModule.path;

    console.log(`[RENDER JOB ${jobId}] Starting render for code length: ${userCode.length}`);

    if (ffmpeg) {
        console.log("Using ffmpeg-static:", ffmpeg);
        process.env.FFMPEG_PATH = ffmpeg;
    }
    if (ffprobe) {
        console.log("Using ffprobe-static:", ffprobe);
        process.env.FFPROBE_PATH = ffprobe;
    }

    const jobDir = path.join(process.cwd(), ".remotion-builds", jobId);
    const outputFilePath = path.join(PUBLIC_EXPORTS_DIR, `${jobId}.mp4`);
    const outputUrl = `/exports/${jobId}.mp4`;

    try {
        // 1. Prepare Workspace
        await fs.mkdir(jobDir, { recursive: true });
        await fs.mkdir(PUBLIC_EXPORTS_DIR, { recursive: true });

        // 2. Normalize User Code
        // Ensure the code exports the component properly for our wrapper
        // If the code uses "export default", we keep it.
        // We will create a wrapper that imports it.

        // We need to handle imports. Ideally we use a bundler that can parse imports.
        // But for this local dev setup, we will just write the file and let Webpack bundle it.
        // We assume the user code doesn't import uninstalled packages.

        const userCompPath = path.join(jobDir, "UserComposition.tsx");
        await fs.writeFile(userCompPath, userCode);

        // 3a. Create Tailwind-like CSS for common classes used in compositions
        const cssPath = path.join(jobDir, "styles.css");
        // discovery of Tailwind arbitrary hex colors
        const hexMatches = userCode.matchAll(/(bg|text|border|from|to|via)-\[#([0-9a-fA-F]{3,6})\]/g);
        let dynamicTailwind = "";
        const seen = new Set();
        for (const match of hexMatches) {
            const [full, type, hex] = match;
            if (seen.has(full)) continue;
            seen.add(full);
            const className = full.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#');
            let property = 'color';
            if (type === 'bg') property = 'background-color';
            if (type === 'border') property = 'border-color';

            dynamicTailwind += `.${className} { ${property}: #${hex} !important; }\n`;
        }

        const tailwindCss = `
/* Core Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }

/* Dynamic Discovery */
${dynamicTailwind}

/* Flexbox Utilities */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1 1 0%; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

/* Position Utilities */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.top-0 { top: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-50 { z-index: 50; }

/* Sizing */
.w-full { width: 100%; }
.h-full { height: 100%; }
.w-screen { width: 100vw; }
.h-screen { height: 100vh; }
.min-h-screen { min-height: 100vh; }

/* Spacing */
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.p-10 { padding: 2.5rem; }
.p-12 { padding: 3rem; }
.p-16 { padding: 4rem; }
.p-20 { padding: 5rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.m-4 { margin: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }

/* Text */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-6xl { font-size: 3.75rem; line-height: 1; }
.text-7xl { font-size: 4.5rem; line-height: 1; }
.text-8xl { font-size: 6rem; line-height: 1; }
.text-9xl { font-size: 8rem; line-height: 1; }
.font-thin { font-weight: 100; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-tighter { letter-spacing: -0.05em; }
.tracking-wide { letter-spacing: 0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }
.leading-none { line-height: 1; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }

/* Colors - Text */
.text-white { color: #ffffff; }
.text-black { color: #000000; }
.text-gray-100 { color: #f3f4f6; }
.text-gray-200 { color: #e5e7eb; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; }
.text-slate-100 { color: #f1f5f9; }
.text-slate-200 { color: #e2e8f0; }
.text-slate-300 { color: #cbd5e1; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-slate-600 { color: #475569; }
.text-slate-700 { color: #334155; }
.text-slate-800 { color: #1e293b; }
.text-slate-900 { color: #0f172a; }
.text-cyan-400 { color: #22d3ee; }
.text-cyan-500 { color: #06b6d4; }
.text-green-400 { color: #4ade80; }
.text-green-500 { color: #22c55e; }
.text-yellow-400 { color: #facc15; }
.text-red-500 { color: #ef4444; }
.text-blue-400 { color: #60a5fa; }
.text-blue-500 { color: #3b82f6; }
.text-purple-400 { color: #c084fc; }
.text-purple-500 { color: #a855f7; }
.text-pink-400 { color: #f472b6; }
.text-pink-500 { color: #ec4899; }

/* Colors - Background */
.bg-transparent { background-color: transparent; }
.bg-white { background-color: #ffffff; }
.bg-black { background-color: #000000; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-900 { background-color: #111827; }
.bg-slate-50 { background-color: #f8fafc; }
.bg-slate-100 { background-color: #f1f5f9; }
.bg-slate-800 { background-color: #1e293b; }
.bg-slate-900 { background-color: #0f172a; }
.bg-slate-950 { background-color: #020617; }
.bg-neutral-900 { background-color: #171717; }
.bg-neutral-950 { background-color: #0a0a0a; }
.bg-zinc-900 { background-color: #18181b; }
.bg-zinc-950 { background-color: #09090b; }
.bg-cyan-500 { background-color: #06b6d4; }
.bg-green-500 { background-color: #22c55e; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-purple-500 { background-color: #a855f7; }
.bg-pink-500 { background-color: #ec4899; }
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }
.bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }

/* Border Radius */
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-3xl { border-radius: 1.5rem; }
.rounded-full { border-radius: 9999px; }

/* Shadows */
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }

/* Overflow */
.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }

/* Opacity */
.opacity-0 { opacity: 0; }
.opacity-25 { opacity: 0.25; }
.opacity-50 { opacity: 0.5; }
.opacity-75 { opacity: 0.75; }
.opacity-100 { opacity: 1; }

/* Border */
.border { border-width: 1px; }
.border-2 { border-width: 2px; }
.border-4 { border-width: 4px; }
.border-white { border-color: #ffffff; }
.border-gray-700 { border-color: #374151; }
.border-transparent { border-color: transparent; }

/* Backdrop */
.backdrop-blur { backdrop-filter: blur(8px); }
.backdrop-blur-sm { backdrop-filter: blur(4px); }
.backdrop-blur-md { backdrop-filter: blur(12px); }
.backdrop-blur-lg { backdrop-filter: blur(16px); }
.backdrop-blur-xl { backdrop-filter: blur(24px); }

/* Remotion AbsoluteFill equivalent */
.AbsoluteFill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
}

/* Custom brand colors */
.bg-\\[\\#05070D\\] { background-color: #05070D; }
.bg-\\[\\#0A0A0B\\] { background-color: #0A0A0B; }
.text-\\[\\#27F2FF\\] { color: #27F2FF; }
.text-\\[\\#B7FF3C\\] { color: #B7FF3C; }

/* Animation keyframes */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 1s linear infinite; }
`;
        await fs.writeFile(cssPath, tailwindCss);

        // 3b. Create Entry Point with CSS import
        const entryPath = path.join(jobDir, "index.tsx");
        const entryContent = `
import React from 'react';
import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import './styles.css';
import UserComp from './UserComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UserComposition"
        component={UserComp}
        durationInFrames={${config.durationInFrames}}
        fps={${config.fps}}
        width={${config.width}}
        height={${config.height}}
      />
    </>
  );
};

registerRoot(RemotionRoot);
`;
        await fs.writeFile(entryPath, entryContent);

        // 4. Bundle
        await db.renderJob.update({
            where: { id: jobId },
            data: { status: "RUNNING", progress: 10, logs: "Bundling project..." }
        });

        const bundleLocation = await bundle({
            entryPoint: entryPath,
            outDir: path.join(jobDir, "bundle"),
            // If you have specific webpack overrides, add them here
            // matching the main app's capabilities
            webpackOverride: (config) => config,
        });

        // 5. Select Composition
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: "UserComposition",
        });

        // 6. Render Media
        await db.renderJob.update({
            where: { id: jobId },
            data: { progress: 30, logs: "Rendering frames..." }
        });

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: "h264",
            outputLocation: outputFilePath,
            onProgress: async ({ progress }) => {
                const percentage = Math.round(progress * 100);
                // Throttle DB updates to avoid spamming (e.g. every 10%)
                if (percentage % 10 === 0) {
                    await db.renderJob.update({
                        where: { id: jobId },
                        data: { progress: 30 + Math.floor(percentage * 0.7) }
                    });
                }
            },
        });

        // 7. Cleanup & Finish
        // await fs.rm(jobDir, { recursive: true, force: true }); // Keep for debugging if needed, or remove

        const stats = await fs.stat(outputFilePath);

        await db.renderJob.update({
            where: { id: jobId },
            data: {
                status: "SUCCEEDED",
                progress: 100,
                outputUrl: outputUrl,
                outputSizeBytes: BigInt(stats.size),
                finishedAt: new Date(),
                durationSeconds: composition.durationInFrames / composition.fps,
                logs: "Render completed successfully."
            }
        });

    } catch (error: any) {
        console.error("Render failed:", error);

        let errorMessage = error.message || "Unknown error";
        if (errorMessage.includes("ffmpeg")) {
            errorMessage = "FFmpeg error: Ensure FFmpeg is installed or use ffmpeg-static.";
        }

        await db.renderJob.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: errorMessage,
                logs: error.stack || errorMessage,
                finishedAt: new Date()
            }
        });
    }
}
