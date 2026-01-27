export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transcribeQueue } from "@/lib/queue";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        storageKey,
        fileName,
        model = "base",
        languageMode,
        scriptOutput,
        prompt
    } = await req.json();

    if (!storageKey) {
        return NextResponse.json({ error: "Storage key required. Upload to S3 first." }, { status: 400 });
    }

    const job = await db.transcriptionJob.create({
        data: {
            userId: session.user.id,
            fileName: fileName || "unnamed_media",
            filePath: storageKey,
            model: model || "base",
            status: "QUEUED",
        },
    });

    // ENQUEUE ONLY - DO NOT RUN WHISPER IN SERVERLESS
    await transcribeQueue.add("transcribe", {
        jobId: job.id,
        userId: session.user.id,
        storageKey,
        options: {
            model,
            languageMode,
            scriptOutput,
            prompt
        }
    });

    return NextResponse.json({
        id: job.id,
        status: "QUEUED",
        message: "Transcription job dispatched to specialized compute node.",
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
