export const runtime = "nodejs";

import { auth } from "@/auth";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/projects - List user's projects
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    const projects = await db.project.findMany({
        where: {
            userId: session.user.id,
            ...(workspaceId ? { workspaceId } : {}),
        },
        orderBy: { updatedAt: "desc" },
        include: {
            versions: {
                orderBy: { versionNumber: "desc" },
                take: 1,
            },
            _count: {
                select: { versions: true, renderJobs: true },
            },
        },
    });

    return NextResponse.json(projects);
}

// POST /api/projects - Create new project
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Auto-heal: Ensure user exists in DB to avoid FK violation
        let user = await db.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            console.log("User not found in DB, auto-creating:", session.user);
            user = await db.user.create({
                data: {
                    id: session.user.id,
                    name: session.user.name || "User",
                    email: session.user.email || `user-${session.user.id}@example.com`,
                    image: session.user.image,
                }
            });
            // Also give default entitlement
            await db.userEntitlement.create({
                data: {
                    userId: user.id,
                    creditsBalance: 100, // Generous start for fixing issues
                }
            });
        }

        const body = await req.json();
        let { name, resolution = "1080p", fps = 30, workspaceId, thumbnailUrl } = body;

        // Defensive parsing
        fps = parseInt(String(fps));
        if (isNaN(fps)) fps = 30;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        let safeComponentName = name.replace(/[^a-zA-Z0-9]/g, '') || "MyAnimation";
        if (/^\d/.test(safeComponentName)) {
            safeComponentName = `Comp${safeComponentName}`;
        }

        console.log("[API/Projects] Creating project:", { name, resolution, fps, thumbnailUrl });

        // Create project with initial version
        const project = await db.project.create({
            data: {
                userId: session.user.id,
                name,
                resolution,
                fps,
                thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1620641788421-7a1c342f42e2?auto=format&fit=crop&q=80&w=800",
                workspaceId: workspaceId || null,
                status: "Draft",
                versions: {
                    create: {
                        versionNumber: 1,
                        title: "Initial Draft",
                        code: `import React from 'react';
import { AbsoluteFill } from 'remotion';

export default function ${safeComponentName}() {
  return (
    <AbsoluteFill className="bg-slate-900 flex items-center justify-center">
      <h1 className="text-6xl font-bold text-white tracking-tight">
        ${name}
      </h1>
    </AbsoluteFill>
  );
}`,
                    },
                },
            } as any,
            include: {
                versions: true,
            },
        });

        // Log activity
        await db.activityLog.create({
            data: {
                userId: session.user.id,
                projectId: project.id,
                action: "PROJECT_CREATED",
                meta: JSON.stringify({ name, resolution, fps }),
            },
        });

        return NextResponse.json(project);
    } catch (error: any) {
        console.error("Project creation error:", error);
        return NextResponse.json(
            { error: "Failed to create project", details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/projects - Delete a project
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
        return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Verify ownership
    const project = await db.project.findFirst({
        where: {
            id: projectId,
            userId: session.user.id,
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db.project.delete({
        where: { id: projectId },
    });

    return NextResponse.json({ success: true });
}
