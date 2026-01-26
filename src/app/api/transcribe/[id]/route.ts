import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

// GET /api/transcribe/[id] - Get job status
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const job = await db.transcriptionJob.findUnique({
            where: { id },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Security: Only owner can access
        if (job.userId !== session.user.id) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        return NextResponse.json({
            id: job.id,
            status: job.status,
            model: job.model,
            fileName: job.fileName,
            durationSeconds: job.durationSeconds,
            jsonOutput: job.jsonOutput,
            errorMessage: job.errorMessage,
            createdAt: job.createdAt.toISOString(),
            updatedAt: job.updatedAt.toISOString(),
        });

    } catch (error: any) {
        console.error("[Transcribe API] Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/transcribe/[id] - Delete a job
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const job = await db.transcriptionJob.findUnique({
            where: { id },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (job.userId !== session.user.id) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        await db.transcriptionJob.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[Transcribe API] Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
