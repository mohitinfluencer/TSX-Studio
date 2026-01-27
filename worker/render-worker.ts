import { Job } from "bullmq";
import { db } from "../lib/db";
import { storage } from "../lib/storage";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs/promises";
import os from "os";
import ffmpeg from "ffmpeg-static";

export async function processRenderJob(job: Job) {
    const { jobId, code, config } = job.data;

    await db.renderJob.update({
        where: { id: jobId },
        data: {
            status: "RUNNING",
            startedAt: new Date(),
            progress: 5
        },
    });

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tsx-render-"));
    const userCompPath = path.join(tempDir, "UserComposition.tsx");
    const cssPath = path.join(tempDir, "styles.css");
    const entryPath = path.join(tempDir, "index.tsx");
    const outputFilePath = path.join(tempDir, `output.mp4`);

    try {
        // 1. Prepare User Code
        await fs.writeFile(userCompPath, code);

        // 2. Dynamic CSS Generation (Tailwind-like)
        const hexMatches = code.matchAll(/(bg|text|border|from|to|via)-\[#([0-9a-fA-F]{3,6})\]/g);
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

        const coreCss = `
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .flex-col { flex-direction: column; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            .w-full { width: 100%; }
            .h-full { height: 100%; }
            .text-white { color: white; }
            .font-bold { font-weight: 700; }
            .bg-slate-900 { background-color: #0f172a; }
            ${dynamicTailwind}
        `;
        await fs.writeFile(cssPath, coreCss);

        // 3. Create Entry Point
        const entryContent = `
            import React from 'react';
            import { registerRoot, Composition } from 'remotion';
            import './styles.css';
            import UserComp from './UserComposition';

            export const RemotionRoot: React.FC = () => {
                return (
                    <Composition
                        id="UserComposition"
                        component={UserComp}
                        durationInFrames={${config.durationInFrames || 300}}
                        fps={${config.fps || 30}}
                        width={${config.width || 1080}}
                        height={${config.height || 1920}}
                    />
                );
            };
            registerRoot(RemotionRoot);
        `;
        await fs.writeFile(entryPath, entryContent);

        // 4. Bundle
        await job.updateProgress(10);
        const bundleLocation = await bundle({
            entryPoint: entryPath,
            outDir: path.join(tempDir, "bundle"),
            webpackOverride: (config) => config,
        });

        // 5. Select Composition
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: "UserComposition",
        });

        // 6. Render Media
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: "h264",
            outputLocation: outputFilePath,
            ffmpegExecutable: ffmpeg || undefined,
            onProgress: ({ progress }: { progress: number }) => {
                const p = 20 + Math.floor(progress * 70);
                job.updateProgress(p);
                if (p % 10 === 0) {
                    db.renderJob.update({
                        where: { id: jobId },
                        data: { progress: p },
                    }).catch(() => { });
                }
            },
        } as any);

        // 7. Upload to S3
        const fileName = `render-${jobId}.mp4`;
        const outputUrl = await storage.putObject(outputFilePath, fileName);
        const stats = await fs.stat(outputFilePath);

        // 8. DB Update
        await db.renderJob.update({
            where: { id: jobId },
            data: {
                status: "SUCCEEDED",
                progress: 100,
                finishedAt: new Date(),
                outputUrl,
                outputSizeBytes: BigInt(stats.size),
                durationSeconds: composition.durationInFrames / composition.fps,
            },
        });

    } catch (error: any) {
        console.error("Render worker failure:", error);
        await db.renderJob.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: error.message || "Unknown error during render",
                finishedAt: new Date(),
            },
        });
        throw error;
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}
