"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderProject = renderProject;
const bundler_1 = require("@remotion/bundler");
const renderer_1 = require("@remotion/renderer");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const electron_1 = require("electron");
const ffmpeg_1 = require("./ffmpeg");
async function reportProgress(jobId, progress, status = "RENDERING", filePath, durationSeconds, outputSizeBytes) {
    try {
        const apiBase = electron_1.app.isPackaged ? 'https://tsx-studio-v2.vercel.app' : 'http://localhost:3000';
        await fetch(`${apiBase}/api/render`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, progress, status, storageKey: filePath, durationSeconds, outputSizeBytes })
        });
    }
    catch (e) {
        console.error("Failed to report progress to server:", e);
    }
}
async function renderProject(options) {
    const { projectId, code, durationInFrames, fps, width, height, onProgress, onLog } = options;
    const durationSeconds = Number((durationInFrames / fps).toFixed(2));
    const baseDir = electron_1.app.getPath('userData');
    const tempDir = path_1.default.join(baseDir, '.tsx-temp', projectId);
    const rendersDir = path_1.default.join(baseDir, 'renders');
    // Set environment variable for Puppeteer to use a writable folder
    process.env.PUPPETEER_CACHE_DIR = path_1.default.join(baseDir, 'puppeteer-cache');
    await fs_extra_1.default.ensureDir(tempDir);
    await fs_extra_1.default.ensureDir(rendersDir);
    await fs_extra_1.default.ensureDir(process.env.PUPPETEER_CACHE_DIR);
    const inputPath = path_1.default.join(tempDir, 'UserComposition.tsx');
    const entryPath = path_1.default.join(tempDir, 'index.tsx');
    const cssPath = path_1.default.join(tempDir, 'styles.css');
    const outputPath = path_1.default.join(rendersDir, `render-${projectId}-${Date.now()}.mp4`);
    try {
        onLog('Internal: Starting build chain...');
        await fs_extra_1.default.writeFile(inputPath, code);
        const entryContent = `
            import React from 'react';
            import { registerRoot, Composition } from 'remotion';
            import './styles.css';
            import UserComp from './UserComposition';

            export const RemotionRoot: React.FC = () => {
                return (
                    <Composition
                        id="Main"
                        component={UserComp}
                        durationInFrames={${durationInFrames}}
                        fps={${fps}}
                        width={${width}}
                        height={${height}}
                    />
                );
            };
            registerRoot(RemotionRoot);
        `;
        await fs_extra_1.default.writeFile(entryPath, entryContent);
        await fs_extra_1.default.writeFile(cssPath, `/* Tailwind placeholder */`);
        onLog('Optimizing bundle...');
        const bundled = await (0, bundler_1.bundle)({
            entryPoint: entryPath,
            outDir: path_1.default.join(tempDir, 'bundle'),
        });
        const composition = await (0, renderer_1.selectComposition)({
            serveUrl: bundled,
            id: 'Main',
        });
        onLog('Allocating resources...');
        // We removed the Electron browser path as it causes hangs without complex setup.
        // Remotion will now auto-provision a stable headless browser in the writable Cache Dir.
        await (0, renderer_1.renderMedia)({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: outputPath,
            concurrency: 1, // Start with single thread to avoid crashes on some hardware
            chromiumOptions: {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
            },
            ffmpegExecutable: (0, ffmpeg_1.getFFmpegPath)() || undefined,
            ffprobeExecutable: (0, ffmpeg_1.getFFprobePath)() || undefined,
            onProgress: ({ progress }) => {
                const p = Math.round(progress * 100);
                onProgress(p);
                if (options.jobId)
                    reportProgress(options.jobId, p, "RENDERING", undefined, durationSeconds);
            },
        });
        let fileSize = 0;
        try {
            const stats = await fs_extra_1.default.stat(outputPath);
            fileSize = stats.size;
        }
        catch (err) { }
        if (options.jobId)
            await reportProgress(options.jobId, 100, "COMPLETED", outputPath, durationSeconds, fileSize);
        onLog('Finalizing...');
        await fs_extra_1.default.remove(tempDir);
        return outputPath;
    }
    catch (error) {
        console.error("Render failed:", error);
        onLog(`Critical Error: ${error.message}`);
        if (options.jobId)
            await reportProgress(options.jobId, 0, "FAILED", error.message);
        throw error;
    }
}
//# sourceMappingURL=render.js.map