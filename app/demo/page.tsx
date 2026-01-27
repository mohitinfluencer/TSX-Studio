import { SAMPLE_TSX } from "@/lib/sampleTsx";
import { StudioClient } from "@/components/studio-client";
import { auth } from "@/auth";

export const metadata = {
    title: "Demo Studio | TSX Studio",
    description: "Experience the elite TSX animation preview engine. Read-only demo mode.",
};

export default async function DemoPage() {
    const session = await auth();

    const demoVersions = [
        {
            id: "demo-version",
            versionNumber: 1,
            title: "Sample Animation",
            code: SAMPLE_TSX,
            validated: true,
            createdAt: new Date().toISOString(),
        }
    ];

    return (
        <div className="min-h-screen bg-background h-screen overflow-hidden">
            <StudioClient
                projectId="demo-project"
                projectName="Demo Project (Read-Only)"
                initialCode={SAMPLE_TSX}
                versions={demoVersions}
                isDemo={true}
                isReadOnly={true}
                isLoggedIn={!!session?.user}
                userPlan={(session?.user as any)?.plan || "FREE"}
            />
        </div>
    );
}
