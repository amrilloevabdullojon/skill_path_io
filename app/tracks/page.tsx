import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { TrackCard } from "@/components/track-card";
import { FadeInUp } from "@/components/ui/fade-in";
import { PageHeader } from "@/components/ui/page-header";
import { resolveRuntimeCatalog, toRuntimeTrackCardData } from "@/lib/learning/runtime-content";
import type { TrackProgress } from "@/lib/learning/runtime-content";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learning Tracks — SkillPath Academy",
  description: "Browse all QA, BA, and DA career tracks. Structured modules, quizzes, and AI missions for every level.",
  openGraph: {
    title: "Learning Tracks — SkillPath Academy",
    type: "website",
  },
};

function calcProgress(moduleIds: string[], progressMap: Record<string, boolean>): TrackProgress {
  const total = moduleIds.length;
  if (total === 0) {
    return { completedModules: 0, totalModules: 0, progressPercent: 0, isStarted: false };
  }
  const completed = moduleIds.filter((id) => progressMap[id] === true).length;
  const started = moduleIds.some((id) => id in progressMap);
  return {
    completedModules: completed,
    totalModules: total,
    progressPercent: Math.round((completed / total) * 100),
    isStarted: started,
  };
}

export default async function TracksPage() {
  const catalog = await resolveRuntimeCatalog({ includeCourseEntities: true });
  const runtimeTracks = catalog.courses
    .filter((course) => course.category === "QA" || course.category === "BA" || course.category === "DA")
    .map(toRuntimeTrackCardData);

  // Build progress map for the signed-in user (skip for guests)
  const progressByModuleId: Record<string, boolean> = {};

  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) {
      const progress = await prisma.userProgress.findMany({
        where: { userId: user.id },
        select: { moduleId: true, completedAt: true },
      });
      for (const p of progress) {
        progressByModuleId[p.moduleId] = p.completedAt !== null;
      }
    }
  }

  const hasProgressData = Object.keys(progressByModuleId).length > 0;

  const tracksWithProgress = runtimeTracks.map((track) => {
    if (!hasProgressData) return track;
    const moduleIds = track.modules.map((m) => m.id);
    const progress = calcProgress(moduleIds, progressByModuleId);
    return { ...track, progress: progress.isStarted ? progress : undefined };
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Треки"
        title="Учебные треки"
        description="Выберите трек, чтобы начать обучение по модулям, квизам и практическим заданиям."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tracksWithProgress.map((track, i) => (
          <FadeInUp key={track.id} delay={i * 0.05}>
            <TrackCard track={track} />
          </FadeInUp>
        ))}
      </div>
    </section>
  );
}
