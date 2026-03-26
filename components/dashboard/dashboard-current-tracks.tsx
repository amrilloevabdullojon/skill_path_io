import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { ProgressStatus, TrackCategory } from "@prisma/client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardTrackCard } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

type DashboardCurrentTracksProps = {
  tracks: DashboardTrackCard[];
};

const categoryStyle: Record<TrackCategory, { chip: string; progress: string; border: string }> = {
  QA: {
    chip: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
    progress: "bg-emerald-400",
    border: "border-emerald-400/25",
  },
  BA: {
    chip: "border-orange-400/35 bg-orange-500/15 text-orange-200",
    progress: "bg-orange-400",
    border: "border-orange-400/25",
  },
  DA: {
    chip: "border-violet-400/35 bg-violet-500/15 text-violet-200",
    progress: "bg-violet-400",
    border: "border-violet-400/25",
  },
};

function moduleStatusClass(status: ProgressStatus) {
  if (status === ProgressStatus.COMPLETED) {
    return "bg-emerald-400";
  }
  if (status === ProgressStatus.IN_PROGRESS) {
    return "bg-sky-400";
  }
  return "bg-muted";
}

export function DashboardCurrentTracks({ tracks }: DashboardCurrentTracksProps) {
  return (
    <DashboardSection
      id="tracks"
      title="Current Learning Tracks"
      description="Live progress, next module, and completion estimates for your active pathways."
      actionLabel="Open all tracks"
      actionHref="/tracks"
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {tracks.map((track, i) => {
          const style = categoryStyle[track.category];
          const isFirstUntouched = i === 0 && track.progressPercent === 0 && track.completedModules === 0;
          return (
            <article
              key={track.id}
              className={cn(
                "group surface-panel-hover flex h-full min-w-0 flex-col rounded-2xl border bg-card/70 p-4 sm:p-5",
                style.border,
                isFirstUntouched && "ring-2 ring-sky-400/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h3 className="truncate text-lg font-semibold text-foreground">{track.title}</h3>
                  <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{track.description}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    style.chip,
                  )}
                >
                  {track.category}
                </span>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{track.completedModules}/{track.totalModules} modules</span>
                  <span>{track.progressPercent}%</span>
                </div>
                <div className="progress-track h-1.5">
                  <div className={cn("h-full rounded-full transition-all duration-500", style.progress)} style={{ width: `${track.progressPercent}%` }} />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="track-info-box min-w-0 px-2.5 py-2">
                  <p className="track-info-label">Next module</p>
                  <p className="track-info-value mt-1 truncate">{track.nextModuleTitle ?? "Done"}</p>
                </div>
                <div className="track-info-box min-w-0 px-2.5 py-2">
                  <p className="track-info-label">Est. completion</p>
                  <p className="track-info-value mt-1 inline-flex items-center gap-1 truncate">
                    <Clock3 className="track-info-label h-3.5 w-3.5" />
                    {track.estimatedCompletion}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="module-order-label">Skills gained</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {track.skillsGained.slice(0, 4).map((skill) => (
                    <span key={skill} className="skill-tag inline-flex px-2 py-0.5 text-[11px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5">
                {track.modulePreview.map((moduleItem) => (
                  <span key={moduleItem.id} className={cn("h-2 w-2 rounded-full", moduleStatusClass(moduleItem.status))} title={moduleItem.title} />
                ))}
              </div>

              <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">Career impact: {track.careerImpact}</p>

              <Link
                href={track.nextModuleHref}
                className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-sky-300 transition-all group-hover:translate-x-0.5 hover:text-sky-200"
              >
                {isFirstUntouched ? "Start here" : "Continue"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </DashboardSection>
  );
}
