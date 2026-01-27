import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    // In a production app, we would verify a permanent API key for the CLI
    // For this implementation, we use a bearer token check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId, storageKey, status } = await req.json();

    if (!projectId || !storageKey) {
        return NextResponse.json({ error: "Missing project or storage key" }, { status: 400 });
    }

    // Find the latest job for this project
    const latestJob = await db.renderJob.findFirst({
        where: { projectId, status: "LOCAL_READY" },
        orderBy: { createdAt: "desc" }
    });

    if (latestJob) {
        await db.renderJob.update({
            where: { id: latestJob.id },
            data: {
                status: status || "UPLOADED",
                outputUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "auto"}.amazonaws.com/${storageKey}`,
                progress: 100,
                finishedAt: new Date(),
                logs: "Result synchronized from local production node."
            }
        });
    } else {
        // Create a new entry if none exists
        const user = await db.project.findUnique({ where: { id: projectId } });
        if (!user) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        await db.renderJob.create({
            data: {
                userId: user.userId,
                projectId,
                versionId: "unknown", // Link to specific version if possible
                status: "UPLOADED",
                outputUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "auto"}.amazonaws.com/${storageKey}`,
                progress: 100,
                finishedAt: new Date(),
                logs: "Result uploaded directly from local production node."
            }
        });
    }

    return NextResponse.json({ success: true });
}
