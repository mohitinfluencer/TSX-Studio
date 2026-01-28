import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs-extra';
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

async function reportProgress(jobId: string, progress: number, status = "RENDERING", path?: string, durationSeconds?: number, outputSizeBytes?: number) {
    try {
        await fetch('http://localhost:3000/api/render', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, progress, status, storageKey: path, durationSeconds, outputSizeBytes })
        });
    } catch (e) {
        console.error("Failed to report progress to server:", e);
    }
}

export async function renderProject(options: RenderOptions): Promise<string> {
    const { projectId, code, durationInFrames, fps, width, height, onProgress, onLog } = options;
    const durationSeconds = Number((durationInFrames / fps).toFixed(2));

    const tempDir = path.join(process.cwd(), '.tsx-temp', projectId);
    await fs.ensureDir(tempDir);

    const inputPath = path.join(tempDir, 'UserComposition.tsx');
    const entryPath = path.join(tempDir, 'index.tsx');
    const cssPath = path.join(tempDir, 'styles.css');
    const outputPath = path.join(process.cwd(), 'renders', `render-${projectId}-${Date.now()}.mp4`);
    await fs.ensureDir(path.dirname(outputPath));

    onLog('Writing project files...');
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

    onLog('Bundling Remotion project...');
    const bundled = await bundle({
        entryPoint: entryPath,
        outDir: path.join(tempDir, 'bundle'),
    });

    const composition = await selectComposition({
        serveUrl: bundled,
        id: 'Main',
    });

    onLog('Starting render pipeline...');
    await renderMedia({
        composition,
        serveUrl: bundled,
        codec: 'h264',
        outputLocation: outputPath,
        ffmpegExecutable: getFFmpegPath() || undefined,
        ffprobeExecutable: getFFprobePath() || undefined,
        onProgress: ({ progress }) => {
            const p = Math.round(progress * 100);
            onProgress(p);
            if (options.jobId) reportProgress(options.jobId, p, "RENDERING", undefined, durationSeconds);
        },
    } as any);

    // Get final file size
    let fileSize = 0;
    try {
        const stats = await fs.stat(outputPath);
        fileSize = stats.size;
    } catch (err) {
        console.error("Failed to get output file size:", err);
    }

    if (options.jobId) await reportProgress(options.jobId, 100, "COMPLETED", outputPath, durationSeconds, fileSize);

    onLog('Cleaning up...');
    await fs.remove(tempDir);

    return outputPath;
}
