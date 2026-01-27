import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { TranscribeClient } from "./transcribe-client";

export default async function TranscribePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Fetch recent jobs for this user
    const jobs = await db.transcriptionJob.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    const serializedJobs = jobs.map(job => ({
        id: job.id,
        status: job.status,
        model: job.model,
        fileName: job.fileName,
        durationSeconds: job.durationSeconds,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        hasOutput: !!job.jsonOutput,
    }));

    return (
        <AppShell>
            <TranscribeClient initialJobs={serializedJobs} />
        </AppShell>
    );
}
