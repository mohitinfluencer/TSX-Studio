import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

// GET /api/transcribe/[id]/download - Download JSON result
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

        if (job.status !== "DONE" || !job.jsonOutput) {
            return NextResponse.json({ error: "Transcription not ready" }, { status: 400 });
        }

        // Create filename from original file
        const baseName = job.fileName.replace(/\.[^.]+$/, "");
        const downloadName = `${baseName}_transcript.json`;

        return new NextResponse(job.jsonOutput, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${downloadName}"`,
            },
        });

    } catch (error: any) {
        console.error("[Transcribe API] Download error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
