import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{
        projectId: string;
        versionId: string;
    }>;
}

// GET /api/projects/[projectId]/versions/[versionId] - Get specific version with code
export async function GET(req: Request, { params }: RouteParams) {
    const { projectId, versionId } = await params;
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

    const version = await db.projectVersion.findUnique({
        where: { id: versionId },
    });

    if (!version || version.projectId !== projectId) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json({
        id: version.id,
        versionNumber: version.versionNumber,
        title: version.title,
        code: version.code,
        validated: version.validated,
        validationErrors: version.validationErrors,
        createdAt: version.createdAt.toISOString(),
        updatedAt: version.updatedAt.toISOString(),
    });
}

// PUT /api/projects/[projectId]/versions/[versionId] - Update version
export async function PUT(req: Request, { params }: RouteParams) {
    const { projectId, versionId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { code, title, validated, validationErrors } = body;

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

    const version = await db.projectVersion.update({
        where: { id: versionId },
        data: {
            ...(code !== undefined && { code }),
            ...(title !== undefined && { title }),
            ...(validated !== undefined && { validated }),
            ...(validationErrors !== undefined && { validationErrors }),
        },
    });

    // Update project updatedAt
    await db.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
    });

    return NextResponse.json({
        id: version.id,
        versionNumber: version.versionNumber,
        title: version.title,
        validated: version.validated,
        createdAt: version.createdAt.toISOString(),
    });
}
