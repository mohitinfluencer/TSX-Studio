export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@/auth";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
        projectId,
        versionId,
        code: customCode,
        format,
        quality,
        width: widthParam,
        height: heightParam,
        fps: fpsParam,
        durationInFrames: durationParam
    } = await req.json();

    // Validate inputs
    if (!projectId || !versionId) {
        return NextResponse.json({ error: "Project and version are required" }, { status: 400 });
    }

    // Verify project ownership and fetch code
    const project = await db.project.findFirst({
        where: {
            id: projectId,
            userId: session.user.id,
        },
        include: {
            versions: {
                where: { id: versionId },
            },
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.versions.length === 0) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Check credits logic (simplified for flow)
    const entitlement = await db.userEntitlement.findUnique({
        where: { userId: session.user.id },
    });

    const width = parseInt(String(widthParam)) || 1080;
    const height = parseInt(String(heightParam)) || 1920;
    const fps = parseInt(String(fpsParam)) || 30;

    // Dynamic cost
    let cost = 1;
    if (width > 1920 || height > 1920) cost = 2; // 4K logic roughly
    if (quality === 'high') cost += 1;

    // TODO: Re-enable credit check if needed. Disabled for smoother testing.
    // if (!entitlement || entitlement.creditsBalance < cost) ...

    // Deduct credits
    if (entitlement && entitlement.creditsBalance >= cost) {
        await db.userEntitlement.update({
            where: { userId: session.user.id },
            data: { creditsBalance: { decrement: cost } },
        });
    }

    // Create render job
    const resolutionString = `${width}x${height}`;

    const job = await db.renderJob.create({
        data: {
            userId: session.user.id,
            projectId,
            versionId,
            outputFormat: format || "mp4",
            resolution: resolutionString,
            fps: fps,
            status: "QUEUED",
            progress: 0,
            logs: "Job queued.",
        },
    });

    // Log activity
    await db.activityLog.create({
        data: {
            userId: session.user.id,
            projectId,
            action: "RENDER_STARTED",
            meta: JSON.stringify({ jobId: job.id, format, quality, resolution: resolutionString, fps }),
        },
    });

    // START REAL RENDERING (Fire and forget)
    // Use custom code if provided (unsaved changes), otherwise use version code
    const code = customCode || project.versions[0].code;

    // We don't await this, so the API returns immediately
    const { renderProject } = await import("@/lib/render-service");
    renderProject(job.id, code, {
        width,
        height,
        fps,
        durationInFrames: parseInt(String(durationParam)) || 300
    }).catch(err => console.error("Background render failed", err));

    return NextResponse.json({
        id: job.id,
        status: job.status,
        message: "Render job queued successfully",
    });
}



export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    // List all jobs
    const jobs = await db.renderJob.findMany({
        where: {
            userId: session.user.id,
            ...(projectId ? { projectId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            project: {
                select: { name: true },
            },
        },
    });

    const serializedJobs = jobs.map(job => ({
        ...job,
        outputSizeBytes: job.outputSizeBytes?.toString() || null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        startedAt: job.startedAt?.toISOString() || null,
        finishedAt: job.finishedAt?.toISOString() || null,
    }));

    return NextResponse.json(serializedJobs);
}
