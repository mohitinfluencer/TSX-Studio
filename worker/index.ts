import { Worker, Job } from "bullmq";
import { db } from "../lib/db";
import { storage } from "../lib/storage";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs/promises";
import os from "os";
import Redis from "ioredis";
import ffmpeg from "ffmpeg-static";

const connection = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null,
});

async function processRenderJob(job: Job) {
    const { jobId } = job.data;
    const renderJob = await db.renderJob.findUnique({
        where: { id: jobId },
        include: { user: true, project: true },
    });

    if (!renderJob) {
        throw new Error(`Job ${jobId} not found`);
    }

    const projectVersion = await db.projectVersion.findFirst({
        where: { projectId: renderJob.projectId, id: renderJob.versionId },
    });

    if (!projectVersion) {
        throw new Error(`Project version not found`);
    }

    await db.renderJob.update({
        where: { id: jobId },
        data: {
            status: "RUNNING",
            startedAt: new Date(),
            progress: 5
        },
    });

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tsx-studio-"));
    const inputFilePath = path.join(tempDir, "animation.tsx");
    const outputFilePath = path.join(tempDir, `output.${renderJob.outputFormat.toLowerCase()}`);

    try {
        // 1. Prepare code
        await fs.writeFile(inputFilePath, projectVersion.code);

        // 2. Create entry point
        const entryFilePath = path.join(tempDir, "entry.tsx");
        const entryCode = `
      import { registerComposition } from 'remotion';
      import Player from './animation';
      import React from 'react';

      export const RemotionVideo = () => {
        return (
          <registerComposition
            id="main"
            component={Player}
            durationInFrames={300}
            fps={${renderJob.fps}}
            width={${renderJob.resolution === "1080p" ? 1080 : 1920}}
            height={${renderJob.resolution === "1080p" ? 1920 : 1080}}
          />
        );
      };
    `;
        await fs.writeFile(entryFilePath, entryCode);

        // 3. Bundle
        await job.updateProgress(10);
        const bundled = await bundle(entryFilePath);

        // 4. Select Composition
        const composition = await selectComposition({
            serveUrl: bundled,
            id: "main",
        });

        // 5. Render
        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: renderJob.outputFormat === "MOV" ? "prores" : "h264",
            outputLocation: outputFilePath,
            ffmpegExecutable: ffmpeg || undefined,
            onProgress: ({ progress }: { progress: number }) => {
                const p = 20 + Math.floor(progress * 70);
                job.updateProgress(p);
                // Throttle DB updates to avoid overwhelming SQLite
                if (p % 10 === 0) {
                    db.renderJob.update({
                        where: { id: jobId },
                        data: { progress: p },
                    }).catch(console.error);
                }
            },
        } as any);

        // 6. Upload
        await job.updateProgress(95);
        const fileName = `render-${jobId}-${Date.now()}.${renderJob.outputFormat.toLowerCase()}`;
        const outputUrl = await storage.putObject(outputFilePath, fileName);

        const stats = await fs.stat(outputFilePath);

        // 7. Update DB Success
        await db.renderJob.update({
            where: { id: jobId },
            data: {
                status: "SUCCEEDED",
                progress: 100,
                finishedAt: new Date(),
                outputUrl,
                outputSizeBytes: BigInt(stats.size),
            },
        });

        // Send Email Notification
        if (renderJob.user.email) {
            const { sendExportCompletedEmail } = await import("../lib/mail");
            await sendExportCompletedEmail(
                renderJob.user.email,
                renderJob.project.name,
                `${process.env.NEXTAUTH_URL}${outputUrl}`
            );
        }

        // Update Usage
        const month = new Date().toISOString().substring(0, 7);
        await db.renderUsage.upsert({
            where: { userId_month: { userId: renderJob.userId, month } },
            update: {
                rendersCount: { increment: 1 },
            },
            create: {
                userId: renderJob.userId,
                month,
                rendersCount: 1,
            },
        });

    } catch (error: any) {
        console.error("Render failed:", error);

        // Refund Credits on failure
        const cost = renderJob.resolution === "4k" ? 2 : 1;
        await db.userEntitlement.update({
            where: { userId: renderJob.userId },
            data: { creditsBalance: { increment: cost } },
        });

        await db.creditTransaction.create({
            data: {
                userId: renderJob.userId,
                type: "REFUND",
                amount: cost,
                renderJobId: jobId,
            },
        });

        await db.renderJob.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: error.message,
                finishedAt: new Date(),
            },
        });
        throw error;
    } finally {
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (err) {
            // Ignore
        }
    }
}

const worker = new Worker("render-jobs", processRenderJob, {
    connection,
    concurrency: 2
});

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

console.log("Render Worker is running...");
