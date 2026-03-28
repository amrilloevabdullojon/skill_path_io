import Link from "next/link";
import { ArrowRight, CheckCircle, Clock3, Layers3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { RuntimeTrackCardData } from "@/lib/learning/runtime-content";

type TrackCardProps = {
  track: RuntimeTrackCardData;
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  QA: "from-emerald-100/80 via-emerald-50/50 to-transparent",
  BA: "from-orange-100/80 via-orange-50/50 to-transparent",
  DA: "from-violet-100/80 via-violet-50/50 to-transparent",
};

const CATEGORY_BORDER: Record<string, string> = {
  QA: "border-emerald-200",
  BA: "border-orange-200",
  DA: "border-violet-200",
};

const CATEGORY_ACCENT_TEXT: Record<string, string> = {
  QA: "text-emerald-400",
  BA: "text-orange-400",
  DA: "text-violet-400",
};

const CATEGORY_PROGRESS_BAR: Record<string, string> = {
  QA: "bg-emerald-500",
  BA: "bg-orange-500",
  DA: "bg-violet-500",
};

const CATEGORY_LABEL: Record<string, string> = {
  QA: "QA Трек",
  BA: "BA Трек",
  DA: "DA Трек",
};

function getCategoryKey(category: string, slug: string): string {
  if (category === "QA" || category === "BA" || category === "DA") return category;
  if (slug.includes("qa")) return "QA";
  if (slug.includes("business") || slug.includes("ba")) return "BA";
  return "DA";
}

export function TrackCard({ track }: TrackCardProps) {
  const category = getCategoryKey(track.category, track.slug);
  const progress = track.progress;
  const icon = (track as RuntimeTrackCardData & { icon?: string }).icon ?? category;

  return (
    <Link href={`/tracks/${track.slug}`} className="block h-full">
      <article
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200",
          "hover:shadow-lg hover:-translate-y-1",
          CATEGORY_BORDER[category] ?? "border-border",
          progress?.isStarted && progress.progressPercent < 100 ? "ring-1 ring-sky-500/25" : "",
          progress?.progressPercent === 100 ? "ring-1 ring-emerald-500/25" : "",
        )}
      >
        {/* Gradient header */}
        <div
          className={cn(
            "relative px-5 pt-5 pb-4 bg-gradient-to-br",
            CATEGORY_GRADIENTS[category] ?? "from-slate-800/50 to-transparent",
          )}
        >
          {/* Big category initial + badges */}
          <div className="mb-3 flex items-center justify-between">
            <span
              className={cn(
                "text-4xl font-black opacity-40",
                CATEGORY_ACCENT_TEXT[category],
              )}
            >
              {icon}
            </span>

            {progress?.progressPercent === 100 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                Завершён
              </span>
            ) : (
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                {track.level}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-sky-300 transition-colors">
            {track.title}
          </h3>

          {/* Category badge */}
          <span
            className={cn(
              "mt-2 inline-block text-xs font-semibold uppercase tracking-wider",
              CATEGORY_ACCENT_TEXT[category],
            )}
          >
            {CATEGORY_LABEL[category] ?? `${category} Трек`}
          </span>
        </div>

        <div className="border-t border-slate-100/80" />

        {/* Body */}
        <div className="px-5 pb-5 space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">{track.description}</p>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {track.durationWeeks} нед.
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="h-3.5 w-3.5" />
              {track.modules.length} модулей
            </span>
          </div>

          {/* Progress bar (if started and not complete) */}
          {progress?.isStarted && progress.progressPercent < 100 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {progress.completedModules} из {progress.totalModules} модулей
                </span>
                <span className={cn("font-semibold", CATEGORY_ACCENT_TEXT[category])}>
                  {progress.progressPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    CATEGORY_PROGRESS_BAR[category] ?? "bg-sky-500",
                  )}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              "bg-foreground/5 border border-border group-hover:bg-sky-500/10 group-hover:border-sky-500/40 group-hover:text-sky-300",
              "text-foreground",
            )}
          >
            {progress?.progressPercent === 100
              ? "Повторить материал"
              : progress?.isStarted
                ? "Продолжить обучение"
                : "Начать трек"}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}
