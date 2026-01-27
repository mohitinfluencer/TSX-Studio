import { Worker } from "bullmq";
import { redisConnection } from "../lib/queue";
import { processRenderJob } from "./render-worker";
import { processTranscriptionJob } from "./transcription-worker";
import { validateEnv } from "../lib/env";

// Ensure we have the right env vars before starting
validateEnv();

const renderWorker = new Worker("render-jobs", processRenderJob, {
    connection: redisConnection,
    concurrency: parseInt(process.env.RENDER_CONCURRENCY || "1"),
});

const transcribeWorker = new Worker("transcription-jobs", processTranscriptionJob, {
    connection: redisConnection,
    concurrency: parseInt(process.env.TRANSCRIBE_CONCURRENCY || "2"),
});

renderWorker.on("completed", (job) => console.log(`[Render] Job ${job.id} succeeded`));
renderWorker.on("failed", (job, err) => console.error(`[Render] Job ${job?.id} failed:`, err));

transcribeWorker.on("completed", (job) => console.log(`[Transcribe] Job ${job.id} succeeded`));
transcribeWorker.on("failed", (job, err) => console.error(`[Transcribe] Job ${job?.id} failed:`, err));

console.log("🚀 Production Job Worker started successfully.");
console.log("- Listening for 'render-jobs'");
console.log("- Listening for 'transcription-jobs'");
