import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{
        projectId: string;
    }>;
}

// GET /api/projects/[projectId]/versions - List versions
export async function GET(req: Request, { params }: RouteParams) {
    const { projectId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify project ownership
    const project = await db.project.findFirst({
        where: {
            id: projectId,
            userId: session.user.id,
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const versions = await db.projectVersion.findMany({
        where: { projectId },
        orderBy: { versionNumber: "desc" },
    });

    return NextResponse.json(versions);
}

// POST /api/projects/[projectId]/versions - Create new version
export async function POST(req: Request, { params }: RouteParams) {
    const { projectId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { code, title } = body;

    if (!code) {
        return NextResponse.json({ error: "Code is required" }, { status: 400 });
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
            },
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get next version number
    const nextVersionNumber = (project.versions[0]?.versionNumber || 0) + 1;

    // Create new version
    const version = await db.projectVersion.create({
        data: {
            projectId,
            versionNumber: nextVersionNumber,
            title: title || `Version ${nextVersionNumber}`,
            code,
        },
    });

    // Update project updatedAt
    await db.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
    });

    // Log activity
    await db.activityLog.create({
        data: {
            userId: session.user.id,
            projectId,
            action: "VERSION_CREATED",
            meta: JSON.stringify({ versionNumber: nextVersionNumber, title }),
        },
    });

    // Return serialized version
    return NextResponse.json({
        id: version.id,
        versionNumber: version.versionNumber,
        title: version.title,
        validated: version.validated,
        createdAt: version.createdAt.toISOString(),
    });
}
