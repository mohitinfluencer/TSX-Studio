export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { renderQueue } from "@/lib/queue";
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
        width: widthParam,
        height: heightParam,
        fps: fpsParam,
        durationInFrames: durationParam
    } = await req.json();

    if (!projectId || !versionId) {
        return NextResponse.json({ error: "Project and version are required" }, { status: 400 });
    }

    const project = await db.project.findFirst({
        where: { id: projectId, userId: session.user.id },
        include: { versions: { where: { id: versionId } } },
    });

    if (!project || project.versions.length === 0) {
        return NextResponse.json({ error: "Project or version not found" }, { status: 404 });
    }

    const width = parseInt(String(widthParam)) || 1080;
    const height = parseInt(String(heightParam)) || 1920;
    const fps = parseInt(String(fpsParam)) || 30;

    let cost = (width > 1920 || height > 1920) ? 2 : 1;

    // Entitlement Check
    const entitlement = await db.userEntitlement.findUnique({
        where: { userId: session.user.id },
    });

    if (!entitlement || entitlement.creditsBalance < cost) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // Deduct credits
    await db.userEntitlement.update({
        where: { userId: session.user.id },
        data: { creditsBalance: { decrement: cost } },
    });

    const job = await db.renderJob.create({
        data: {
            userId: session.user.id,
            projectId,
            versionId,
            outputFormat: format || "mp4",
            resolution: `${width}x${height}`,
            fps,
            status: "QUEUED",
        },
    });

    // ENQUEUE ONLY - DO NOT RENDER IN SERVERLESS
    const code = customCode || project.versions[0].code;
    await renderQueue.add("render", {
        jobId: job.id,
        userId: session.user.id,
        code,
        config: {
            width,
            height,
            fps,
            durationInFrames: parseInt(String(durationParam)) || 300
        }
    });

    return NextResponse.json({
        id: job.id,
        status: "QUEUED",
        message: "Render job added to production cluster queue.",
    });
}

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const jobs = await db.renderJob.findMany({
        where: { userId: session.user.id, ...(projectId ? { projectId } : {}) },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { project: { select: { name: true } } },
    });

    return NextResponse.json(jobs.map(j => ({
        ...j,
        outputSizeBytes: j.outputSizeBytes?.toString() || null,
        createdAt: j.createdAt.toISOString(),
        updatedAt: j.updatedAt.toISOString(),
    })));
}
