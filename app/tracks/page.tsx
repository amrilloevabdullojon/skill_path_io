import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowRight, Compass, LogIn, PlayCircle } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { TracksFilterGrid } from "@/components/tracks/tracks-filter-grid";
import { resolveRuntimeCatalog, toRuntimeTrackCardData } from "@/lib/learning/runtime-content";
import type { TrackProgress } from "@/lib/learning/runtime-content";
import { authOptions } from "@/lib/auth";
import { findRuntimeModuleProgress } from "@/lib/learning/progress";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learning Tracks",
  description: "Browse all QA, BA, and DA career tracks. Structured modules, quizzes, and AI missions for every level.",
  openGraph: {
    title: "Learning Tracks",
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
  const recommendedTrack =
    tracksWithProgress.find((track) => track.progress?.isStarted && track.progress.progressPercent < 100 && !track.comingSoon) ??
    tracksWithProgress.find((track) => !track.comingSoon && track.progress?.progressPercent !== 100) ??
    tracksWithProgress.find((track) => !track.comingSoon);

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Треки"
        title="Учебные треки"
        description="Выберите трек, чтобы начать обучение по модулям, квизам и практическим заданиям."
      />

      {recommendedTrack ? (
        <section className="mb-6 overflow-hidden rounded-2xl border border-indigo-400/20 bg-card">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/25 bg-indigo-500/10 text-indigo-300">
                  <Compass className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="kicker">Рекомендуемый путь</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {recommendedTrack.progress?.isStarted ? "Продолжите текущий трек" : "Начните с этого трека"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Каталог остаётся ниже, но для обучения лучше держать один основной маршрут. Сейчас самый понятный следующий выбор: <span className="font-semibold text-foreground">{recommendedTrack.title}</span>.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="chip-neutral px-2.5 py-1">{recommendedTrack.category}</span>
                <span className="chip-neutral px-2.5 py-1">{recommendedTrack.level}</span>
                <span className="chip-neutral px-2.5 py-1">{recommendedTrack.modules.length} модулей</span>
                {recommendedTrack.progress?.isStarted ? (
                  <span className="chip-neutral px-2.5 py-1">{recommendedTrack.progress.progressPercent}% завершено</span>
                ) : null}
              </div>
            </div>
            <aside className="border-t border-border-subtle bg-background/30 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Следующее действие</p>
                <Link href={`/tracks/${recommendedTrack.slug}`} className="btn-primary inline-flex w-full justify-center gap-2 px-4 py-3">
                  {recommendedTrack.progress?.isStarted ? "Продолжить" : "Открыть трек"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/dashboard" className="btn-secondary inline-flex w-full justify-center gap-2 px-4 py-2.5 text-sm">
                  <PlayCircle className="h-4 w-4" />
                  Вернуться к плану
                </Link>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

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
