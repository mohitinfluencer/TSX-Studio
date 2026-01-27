export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// This endpoint now only provides instructions for local transcription
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        storageKey,
        fileName,
        model = "base",
    } = await req.json();

    const job = await db.transcriptionJob.create({
        data: {
            userId: session.user.id,
            fileName: fileName || "unnamed_media",
            filePath: storageKey || "local_path",
            model: model || "base",
            status: "LOCAL_READY",
        },
    });

    return NextResponse.json({
        id: job.id,
        status: "LOCAL_READY",
        message: "Transcription ready for local processing. Use 'tsx-studio transcribe'.",
    });
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobs = await db.transcriptionJob.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return NextResponse.json(jobs);
}

// Support for CLI to push results back
export async function PUT(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new NextResponse("Unauthorized", { status: 401 });

    const { jobId, jsonOutput, status } = await req.json();

    const job = await db.transcriptionJob.findUnique({
        where: { id: jobId }
    });

    if (job) {
        await db.transcriptionJob.update({
            where: { id: jobId },
            data: {
                status: status || "DONE",
                jsonOutput: JSON.stringify(jsonOutput),
            },
        });
    }

    return NextResponse.json({ success: true });
}
