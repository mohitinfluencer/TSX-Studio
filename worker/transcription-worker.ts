import { Job } from "bullmq";
import { db } from "../lib/db";
import { s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

export async function processTranscriptionJob(job: Job) {
    const { jobId, storageKey, options } = job.data;

    await db.transcriptionJob.update({
        where: { id: jobId },
        data: { status: "RUNNING" },
    });

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tsx-transcribe-"));
    const inputPath = path.join(tempDir, "input_media");
    const outputPath = path.join(tempDir, "output.json");

    try {
        // 1. Download from S3
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: storageKey,
        });
        const response = await s3.send(command);
        if (!response.Body) throw new Error("Could not download file from S3");

        await pipeline(response.Body as any, createWriteStream(inputPath));

        // 2. Run Whisper (Dedicated Python Worker Script)
        // This expects the transcriber/transcribe.py to exist in the worker environment
        const pythonScript = path.join(process.cwd(), "transcriber", "transcribe.py");
        const pythonCommand = process.platform === "win32" ? "python" : "python3";

        const args = [pythonScript, inputPath, options.model || "base", outputPath];
        if (options.languageMode && options.languageMode !== "auto") {
            args.push("--language", options.languageMode);
        }
        if (options.prompt) args.push("--prompt", options.prompt);

        await new Promise((resolve, reject) => {
            const child = spawn(pythonCommand, args);
            let stderr = "";

            child.stderr.on("data", (data) => {
                stderr += data.toString();
                const progressMatch = data.toString().match(/PROGRESS:(\d+)/);
                if (progressMatch) {
                    job.updateProgress(parseInt(progressMatch[1]));
                }
            });

            child.on("close", (code) => {
                if (code === 0) resolve(true);
                else reject(new Error(`Whisper process failed with code ${code}: ${stderr}`));
            });

            child.on("error", reject);
        });

        // 3. Read Output & Update DB
        const jsonContent = await fs.readFile(outputPath, "utf-8");
        const parsed = JSON.parse(jsonContent);

        await db.transcriptionJob.update({
            where: { id: jobId },
            data: {
                status: "DONE",
                jsonOutput: jsonContent,
                durationSeconds: parsed.duration || null,
            },
        });

    } catch (error: any) {
        console.error("Transcription worker failure:", error);
        await db.transcriptionJob.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: error.message || "Unknown error during transcription",
            },
        });
        throw error;
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}
