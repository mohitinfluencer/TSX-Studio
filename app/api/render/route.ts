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

    const { projectId, versionId } = await req.json();

    const job = await db.renderJob.create({
        data: {
            userId: session.user.id,
            projectId,
            versionId,
            status: "LOCAL_READY",
            logs: "Project bundled for local rendering. Use 'tsx-studio render' to proceed.",
        },
    });

    return NextResponse.json({
        id: job.id,
        status: "LOCAL_READY",
        cliCommand: `tsx-studio render ${projectId}`,
        message: "Project is ready for local rendering.",
    });
}

// GET /api/render - List status
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const jobs = await db.renderJob.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20
    });

    return NextResponse.json(jobs);
}

// Special endpoint for CLI results synchronization
export async function PUT(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new NextResponse("Unauthorized", { status: 401 });

    const { projectId, storageKey, status } = await req.json();

    const job = await db.renderJob.findFirst({
        where: { projectId, status: "LOCAL_READY" },
        orderBy: { createdAt: "desc" }
    });

    if (job) {
        await db.renderJob.update({
            where: { id: job.id },
            data: {
                status: status || "SUCCEEDED",
                outputUrl: storageKey,
                finishedAt: new Date(),
                progress: 100
            }
        });
    }

    return NextResponse.json({ success: true });
}
