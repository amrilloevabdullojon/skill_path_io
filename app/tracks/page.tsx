import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { TracksFilterGrid } from "@/components/tracks/tracks-filter-grid";
import { resolveRuntimeCatalog, toRuntimeTrackCardData } from "@/lib/learning/runtime-content";
import type { TrackProgress } from "@/lib/learning/runtime-content";
import { authOptions } from "@/lib/auth";
import { findRuntimeModuleProgress } from "@/lib/learning/progress";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learning Tracks — Levio",
  description: "Browse all QA, BA, and DA career tracks. Structured modules, quizzes, and AI missions for every level.",
  openGraph: {
    title: "Learning Tracks — Levio",
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
      for (const track of runtimeTracks) {
        const progress = await findRuntimeModuleProgress({
          userId: user.id,
          moduleIds: track.modules.map((moduleItem) => moduleItem.id),
          source: track.source,
        });
        for (const p of progress) {
          progressByModuleId[p.moduleId] = p.completedAt !== null;
        }
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

      {!session && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4">
          <p className="text-sm text-foreground/80">
            Войдите в аккаунт, чтобы видеть свой прогресс по трекам и продолжать с того места, где остановились.
          </p>
          <Link href="/login" className="btn-primary shrink-0 gap-2 text-sm">
            <LogIn className="w-4 h-4" />
            Войти
          </Link>
        </div>
      )}

      <TracksFilterGrid tracks={tracksWithProgress} isAuthenticated={!!session} />
    </section>
  );
}
