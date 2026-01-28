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
        // Use the actual website URL if in production
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
    // Use UserData or Temp for writing files in production (safe & writable)
    const baseDir = electron_1.app.getPath('userData');
    const tempDir = path_1.default.join(baseDir, '.tsx-temp', projectId);
    const rendersDir = path_1.default.join(baseDir, 'renders');
    await fs_extra_1.default.ensureDir(tempDir);
    await fs_extra_1.default.ensureDir(rendersDir);
    const inputPath = path_1.default.join(tempDir, 'UserComposition.tsx');
    const entryPath = path_1.default.join(tempDir, 'index.tsx');
    const cssPath = path_1.default.join(tempDir, 'styles.css');
    const outputPath = path_1.default.join(rendersDir, `render-${projectId}-${Date.now()}.mp4`);
    onLog('Writing project files...');
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
    onLog('Bundling Remotion project...');
    const bundled = await (0, bundler_1.bundle)({
        entryPoint: entryPath,
        outDir: path_1.default.join(tempDir, 'bundle'),
    });
    const composition = await (0, renderer_1.selectComposition)({
        serveUrl: bundled,
        id: 'Main',
    });
    onLog('Starting render pipeline...');
    // CRITICAL: In Electron, we MUST use the Electron executable as the Chromium browser for Remotion
    // This removes the need for Puppyeteer to download a separate Chromium.
    const browserPath = process.execPath;
    await (0, renderer_1.renderMedia)({
        composition,
        serveUrl: bundled,
        codec: 'h264',
        outputLocation: outputPath,
        chromiumExecutable: browserPath,
        ffmpegExecutable: (0, ffmpeg_1.getFFmpegPath)() || undefined,
        ffprobeExecutable: (0, ffmpeg_1.getFFprobePath)() || undefined,
        onProgress: ({ progress }) => {
            const p = Math.round(progress * 100);
            onProgress(p);
            if (options.jobId)
                reportProgress(options.jobId, p, "RENDERING", undefined, durationSeconds);
        },
    });
    // Get final file size
    let fileSize = 0;
    try {
        const stats = await fs_extra_1.default.stat(outputPath);
        fileSize = stats.size;
    }
    catch (err) {
        console.error("Failed to get output file size:", err);
    }
    if (options.jobId)
        await reportProgress(options.jobId, 100, "COMPLETED", outputPath, durationSeconds, fileSize);
    onLog('Cleaning up...');
    await fs_extra_1.default.remove(tempDir);
    return outputPath;
}
//# sourceMappingURL=render.js.map