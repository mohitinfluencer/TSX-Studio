import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ExportList } from "@/components/export-list";

export default async function ExportsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const jobs = await db.renderJob.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            project: {
                select: { name: true },
            },
        },
    });

    // Serialize for client component
    const serializedJobs = jobs.map(job => ({
        id: job.id,
        projectId: job.projectId,
        versionId: job.versionId,
        status: job.status,
        outputFormat: job.outputFormat,
        resolution: job.resolution,
        fps: job.fps,
        progress: job.progress,
        durationSeconds: job.durationSeconds,
        outputSizeBytes: job.outputSizeBytes?.toString() || null,
        outputUrl: job.outputUrl,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        startedAt: job.startedAt?.toISOString() || null,
        finishedAt: job.finishedAt?.toISOString() || null,
        project: job.project,
    }));

    return (
        <AppShell>
            <div className="p-8">
                <ExportList initialJobs={serializedJobs} />
            </div>
        </AppShell>
    );
}
