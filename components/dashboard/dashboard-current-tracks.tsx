import Link from "next/link";
import { ArrowUpRight, Clock3, Rocket } from "lucide-react";
import { ProgressStatus, TrackCategory } from "@prisma/client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardTrackCard } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

type DashboardCurrentTracksProps = {
  tracks: DashboardTrackCard[];
};

const categoryStyle: Record<TrackCategory, { chip: string; progress: string; border: string; glow: string }> = {
  QA: {
    chip: "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    progress: "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]",
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    glow: "bg-emerald-500/10",
  },
  BA: {
    chip: "border-orange-500/40 bg-orange-500/20 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]",
    progress: "bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.6)]",
    border: "border-orange-500/30 hover:border-orange-500/50",
    glow: "bg-orange-500/10",
  },
  DA: {
    chip: "border-violet-500/40 bg-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]",
    progress: "bg-gradient-to-r from-violet-500 to-fuchsia-400 shadow-[0_0_10px_rgba(139,92,246,0.6)]",
    border: "border-violet-500/30 hover:border-violet-500/50",
    glow: "bg-violet-500/10",
  },
};

function moduleStatusClass(status: ProgressStatus) {
  if (status === ProgressStatus.COMPLETED) {
    return "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
  }
  if (status === ProgressStatus.IN_PROGRESS) {
    return "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]";
  }
  return "bg-slate-700/50 border border-slate-600/50";
}

export async function DashboardCurrentTracks({ tracks }: DashboardCurrentTracksProps) {
  return (
    <DashboardSection
      id="tracks"
      title="Текущие треки"
      description="Продолжайте изучение и закрывайте модули шаг за шагом."
      actionLabel="Все треки"
      actionHref="/tracks"
    >
      <div className={cn(
        "grid gap-6",
        tracks.length === 1 ? "grid-cols-1 max-w-[450px]" :
        tracks.length === 2 ? "grid-cols-1 lg:grid-cols-2 max-w-[900px]" :
        "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      )}>
        {tracks.map((track, i) => {
          const style = categoryStyle[track.category];
          const isFirstUntouched = i === 0 && track.progressPercent === 0 && track.completedModules === 0;
          return (
            <article
              key={track.id}
              className={cn(
                "relative group flex h-full min-w-0 flex-col rounded-[28px] border bg-card/60 backdrop-blur-xl p-6 sm:p-7 overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
                style.border,
                isFirstUntouched && "ring-2 ring-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]",
              )}
            >
              <div className={`absolute top-0 right-0 w-[150px] h-[150px] blur-[50px] pointer-events-none transition-opacity opacity-50 group-hover:opacity-100 ${style.glow}`} />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="min-w-0 space-y-1.5">
                  <h3 className="truncate text-xl font-bold text-foreground drop-shadow-sm">{track.title}</h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-foreground/70">{track.description}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest",
                    style.chip,
                  )}
                >
                  {track.category}
                </span>
              </div>

              <div className="mt-6 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground/60 uppercase tracking-widest">
                  <span>{track.completedModules} из {track.totalModules} модулей</span>
                  <span className="text-foreground">{track.progressPercent}%</span>
                </div>
                <div className="progress-track h-2 bg-slate-800/50 border border-slate-700/50 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", style.progress)} style={{ width: `${track.progressPercent}%` }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs relative z-10">
                <div className="bg-background/40 border border-border/40 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Следующий модуль</p>
                  <p className="font-semibold text-foreground mt-1 truncate">{track.nextModuleTitle ?? "Завершено ✨"}</p>
                </div>
                <div className="bg-background/40 border border-border/40 rounded-xl px-3 py-2.5 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider truncate">Осталось времени</p>
                  <p className="font-semibold text-foreground mt-1 inline-flex items-center gap-1.5 truncate">
                    <Clock3 className="h-3.5 w-3.5 text-indigo-400" />
                    {track.estimatedCompletion}
                  </p>
                </div>
              </div>

              <div className="mt-5 relative z-10">
                <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider mb-2">Навыки</p>
                <div className="flex flex-wrap gap-1.5">
                  {track.skillsGained.slice(0, 4).map((skill) => (
                    <span key={skill} className="inline-flex px-2 py-1 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-md text-[10px] font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-1.5 relative z-10 bg-background/20 p-2 rounded-lg border border-border/20 w-fit">
                {track.modulePreview.map((moduleItem) => (
                  <span key={moduleItem.id} className={cn("h-2.5 w-2.5 rounded-full transition-colors", moduleStatusClass(moduleItem.status))} title={moduleItem.title} />
                ))}
              </div>

              <div className="mt-auto pt-6 relative z-10">
                <Link
                  href={track.nextModuleHref}
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 border border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-white font-bold rounded-xl transition-all group-hover:-translate-y-0.5"
                >
                  {isFirstUntouched ? (
                    <>
                      <Rocket className="h-4 w-4" /> Начать первый урок
                    </>
                  ) : (
                    <>
                      Продолжить <ArrowUpRight className="h-4 w-4" />
                    </>
                  )}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </DashboardSection>
  );
}
