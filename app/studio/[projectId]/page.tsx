export const dynamic = "force-dynamic";

import { auth } from "@/auth";

import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { StudioClient } from "@/components/studio-client";

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function StudioPage({ params }: PageProps) {
  const { projectId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Handle demo project
  if (projectId === "demo") {
    return (
      <StudioClient
        projectId="demo"
        projectName="Demo Project"
        projectStatus="Draft"
        initialCode={`import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ====================================================================
// COMPOSITION CONFIG (Required for auto-discovery)
// ====================================================================
export const compositionConfig = {
  id: 'DemoAnimation',
  durationInSeconds: 10,
  fps: 60,
  width: 1920,
  height: 1080,
};

export default function DemoAnimation() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="bg-slate-900 flex items-center justify-center">
      <h1 
        style={{ opacity }}
        className="text-6xl font-bold text-white tracking-tight"
      >
        TSX Studio Demo
      </h1>
    </AbsoluteFill>
  );
}`}
        versions={[
          { id: "demo-v1", versionNumber: 1, title: "Demo Version", createdAt: new Date().toISOString(), code: "" }
        ]}
        isDemo={true}
      />
    );
  }

  // Fetch real project with ALL version codes
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get latest version code
  const latestVersion = project.versions[0];
  const initialCode = latestVersion?.code || `import React from 'react';
import { AbsoluteFill } from 'remotion';

export default function ${project.name.replace(/\s+/g, '')}() {
  return (
    <AbsoluteFill className="bg-slate-900 flex items-center justify-center">
      <h1 className="text-6xl font-bold text-white tracking-tight">
        ${project.name}
      </h1>
    </AbsoluteFill>
  );
}`;

  // Serialize versions with code for client
  const serializedVersions = project.versions.map(v => ({
    id: v.id,
    versionNumber: v.versionNumber,
    title: v.title,
    validated: v.validated,
    code: v.code,
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <StudioClient
      projectId={project.id}
      projectName={project.name}
      projectStatus={project.status}
      initialCode={initialCode}
      versions={serializedVersions}
      resolution={project.resolution}
      fps={project.fps}
      isDemo={false}
    />
  );
}
