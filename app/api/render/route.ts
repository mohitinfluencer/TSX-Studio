export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// This endpoint now only provides the rendering INSTRUCTIONS for local run
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let { projectId, versionId, format, resolution, fps, durationSeconds } = await req.json();

    if (!versionId) {
        const latestVersion = await db.projectVersion.findFirst({
            where: { projectId },
            orderBy: { versionNumber: "desc" }
        });
        versionId = latestVersion?.id;
    }

    if (!versionId) {
        return new NextResponse("Project has no saved versions. Please save your work first.", { status: 400 });
    }

    const job = await db.renderJob.create({
        data: {
            userId: session.user.id,
            projectId,
            versionId,
            status: "RENDERING", // Start as rendering immediately for new flow
            outputFormat: format || "MP4",
            resolution: resolution || "1080x1920",
            fps: fps || 30,
            durationSeconds: durationSeconds || 5.0,
            progress: 0,
            logs: "Render initialized via Studio.",
        },
    });

    return NextResponse.json(job);
}

// GET /api/render - List status
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const jobs = await db.renderJob.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
            project: {
                select: { name: true },
            },
        },
    });

    // Ultra-safe serialization: Map every field manually to ensure no BigInt leaks
    const serializedJobs = jobs.map(job => ({
        id: job.id,
        userId: job.userId,
        projectId: job.projectId,
        versionId: job.versionId,
        status: job.status,
        outputFormat: job.outputFormat,
        resolution: job.resolution,
        fps: job.fps,
        progress: job.progress,
        durationSeconds: job.durationSeconds,
        errorMessage: job.errorMessage,
        outputUrl: job.outputUrl,
        outputSizeBytes: job.outputSizeBytes ? job.outputSizeBytes.toString() : null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        startedAt: job.startedAt?.toISOString() || null,
        finishedAt: job.finishedAt?.toISOString() || null,
        project: job.project
    }));

    return NextResponse.json(serializedJobs);
}

// Special endpoint for CLI/Desktop results synchronization
export async function PUT(req: Request) {
    const { jobId, projectId, storageKey, status, progress, errorMessage, durationSeconds, outputSizeBytes } = await req.json();

    let job;
    if (jobId) {
        job = await db.renderJob.findUnique({ where: { id: jobId } });
    } else {
        job = await db.renderJob.findFirst({
            where: { projectId, status: { in: ["RENDERING", "LOCAL_READY", "QUEUED"] } },
            orderBy: { createdAt: "desc" }
        });
    }

    if (job) {
        await db.renderJob.update({
            where: { id: job.id },
            data: {
                status: status || job.status,
                outputUrl: storageKey || job.outputUrl,
                finishedAt: status === "COMPLETED" || status === "SUCCEEDED" ? new Date() : job.finishedAt,
                progress: progress !== undefined ? progress : job.progress,
                errorMessage: errorMessage || job.errorMessage,
                durationSeconds: durationSeconds !== undefined ? durationSeconds : job.durationSeconds,
                outputSizeBytes: outputSizeBytes !== undefined ? BigInt(outputSizeBytes) : job.outputSizeBytes,
            }
        });
    }

    return NextResponse.json({ success: true });
}
