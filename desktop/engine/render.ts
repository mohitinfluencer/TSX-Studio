import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs-extra';
import { app } from 'electron';
import { getFFmpegPath, getFFprobePath } from './ffmpeg';

interface RenderOptions {
    jobId?: string;
    projectId: string;
    code: string;
    durationInFrames: number;
    fps: number;
    width: number;
    height: number;
    onProgress: (progress: number) => void;
    onLog: (log: string) => void;
}

async function reportProgress(jobId: string, progress: number, status = "RENDERING", filePath?: string, durationSeconds?: number, outputSizeBytes?: number) {
    try {
        const apiBase = app.isPackaged ? 'https://tsx-studio-v2.vercel.app' : 'http://localhost:3000';
        await fetch(`${apiBase}/api/render`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, progress, status, storageKey: filePath, durationSeconds, outputSizeBytes })
        });
    } catch (e) {
        console.error("Failed to report progress to server:", e);
    }
}

export async function renderProject(options: RenderOptions): Promise<string> {
    const { projectId, code, durationInFrames, fps, width, height, onProgress, onLog } = options;
    const durationSeconds = Number((durationInFrames / fps).toFixed(2));

    const baseDir = app.getPath('userData');
    const tempDir = path.join(baseDir, '.tsx-temp', projectId);
    const rendersDir = path.join(baseDir, 'renders');

    // Set environment variable for Puppeteer to use a writable folder
    process.env.PUPPETEER_CACHE_DIR = path.join(baseDir, 'puppeteer-cache');

    await fs.ensureDir(tempDir);
    await fs.ensureDir(rendersDir);
    await fs.ensureDir(process.env.PUPPETEER_CACHE_DIR);

    const inputPath = path.join(tempDir, 'UserComposition.tsx');
    const entryPath = path.join(tempDir, 'index.tsx');
    const cssPath = path.join(tempDir, 'styles.css');
    const outputPath = path.join(rendersDir, `render-${projectId}-${Date.now()}.mp4`);

    try {
        onLog('Internal: Starting build chain...');
        await fs.writeFile(inputPath, code);

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
        await fs.writeFile(entryPath, entryContent);
        await fs.writeFile(cssPath, `/* Tailwind placeholder */`);

        onLog('Optimizing bundle...');
        const bundled = await bundle({
            entryPoint: entryPath,
            outDir: path.join(tempDir, 'bundle'),
        });

        const composition = await selectComposition({
            serveUrl: bundled,
            id: 'Main',
        });

        onLog('Allocating resources...');

        // We removed the Electron browser path as it causes hangs without complex setup.
        // Remotion will now auto-provision a stable headless browser in the writable Cache Dir.
        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: outputPath,
            concurrency: 1, // Start with single thread to avoid crashes on some hardware
            chromiumOptions: {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
            },
            ffmpegExecutable: getFFmpegPath() || undefined,
            ffprobeExecutable: getFFprobePath() || undefined,
            onProgress: ({ progress }) => {
                const p = Math.round(progress * 100);
                onProgress(p);
                if (options.jobId) reportProgress(options.jobId, p, "RENDERING", undefined, durationSeconds);
            },
        } as any);

        let fileSize = 0;
        try {
            const stats = await fs.stat(outputPath);
            fileSize = stats.size;
        } catch (err) { }

        if (options.jobId) await reportProgress(options.jobId, 100, "COMPLETED", outputPath, durationSeconds, fileSize);

        onLog('Finalizing...');
        await fs.remove(tempDir);
        return outputPath;

    } catch (error: any) {
        console.error("Render failed:", error);
        onLog(`Critical Error: ${error.message}`);
        if (options.jobId) await reportProgress(options.jobId, 0, "FAILED", error.message);
        throw error;
    }
}
