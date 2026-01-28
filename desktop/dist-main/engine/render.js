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
async function reportProgress(jobId, progress, status = "RENDERING", filePath, durationSeconds, outputSizeBytes, errorMsg) {
    try {
        const apiBase = electron_1.app.isPackaged ? 'https://tsx-studio-v2.vercel.app' : 'http://localhost:3000';
        await fetch(`${apiBase}/api/render`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobId,
                progress,
                status,
                storageKey: filePath,
                durationSeconds,
                outputSizeBytes,
                errorMessage: errorMsg
            })
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
    const logFile = path_1.default.join(baseDir, 'render-debug.log');
    // Fix for esbuild in packaged Electron
    if (electron_1.app.isPackaged) {
        // Point esbuild to the unpacked binary location
        const esbuildPath = path_1.default.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe');
        if (await fs_extra_1.default.pathExists(esbuildPath)) {
            process.env.ESBUILD_BINARY_PATH = esbuildPath;
        }
    }
    await fs_extra_1.default.remove(logFile);
    const log = async (msg) => {
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] ${msg}\n`;
        await fs_extra_1.default.appendFile(logFile, formatted);
        onLog(msg);
    };
    await fs_extra_1.default.ensureDir(tempDir);
    await fs_extra_1.default.ensureDir(rendersDir);
    const inputPath = path_1.default.join(tempDir, 'UserComposition.tsx');
    const entryPath = path_1.default.join(tempDir, 'index.tsx');
    const cssPath = path_1.default.join(tempDir, 'styles.css');
    const outputPath = path_1.default.join(rendersDir, `render-${projectId}-${Date.now()}.mp4`);
    try {
        await log('Writing project files to secure storage...');
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
        await log('Bundling Remotion project (this may take a moment)...');
        // This is where esbuild is triggered
        const bundled = await (0, bundler_1.bundle)({
            entryPoint: entryPath,
            outDir: path_1.default.join(tempDir, 'bundle'),
        });
        await log('Analyzing bundle...');
        const composition = await (0, renderer_1.selectComposition)({
            serveUrl: bundled,
            id: 'Main',
        });
        await log('Starting hardware-accelerated render...');
        await (0, renderer_1.renderMedia)({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: outputPath,
            concurrency: 1,
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
        await log('Render complete! Notifying server...');
        if (options.jobId)
            await reportProgress(options.jobId, 100, "COMPLETED", outputPath, durationSeconds, fileSize);
        await fs_extra_1.default.remove(tempDir);
        return outputPath;
    }
    catch (error) {
        const errorStack = error.stack || error.message;
        await fs_extra_1.default.appendFile(logFile, `CRITICAL ERROR:\n${errorStack}\n`);
        console.error("Render failed:", error);
        onLog(`Failed: ${error.message}`);
        if (options.jobId)
            await reportProgress(options.jobId, 0, "FAILED", undefined, undefined, undefined, error.message);
        throw error;
    }
}
//# sourceMappingURL=render.js.map