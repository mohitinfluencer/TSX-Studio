import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId, code, title } = await req.json();
    console.log("[API/Versions] Creating version for project:", projectId);

    if (!projectId || !code) {
        return NextResponse.json({ error: "Project ID and code are required" }, { status: 400 });
    }

    // Verify project ownership
    const project = await db.project.findFirst({
        where: {
            id: projectId,
            userId: session.user.id,
        },
        include: {
            versions: {
                orderBy: { versionNumber: "desc" },
                take: 1,
            }
        }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const nextVersionNumber = (project.versions[0]?.versionNumber || 0) + 1;

    const version = await db.projectVersion.create({
        data: {
            projectId,
            versionNumber: nextVersionNumber,
            title: title || `Version ${nextVersionNumber}`,
            code,
        },
    });

    // Update project's updatedAt
    await db.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
    });

    return NextResponse.json(version);
}
