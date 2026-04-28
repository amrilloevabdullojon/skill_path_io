import Link from "next/link";
import { ArrowRight, CheckCircle, Clock3, Layers3, LockKeyhole } from "lucide-react";

import { cn } from "@/lib/utils";
import { RuntimeTrackCardData } from "@/lib/learning/runtime-content";

type TrackCardProps = {
  track: RuntimeTrackCardData;
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  QA: "from-emerald-500/15 via-emerald-500/5 to-transparent",
  BA: "from-orange-500/15 via-orange-500/5 to-transparent",
  DA: "from-violet-500/15 via-violet-500/5 to-transparent",
};

const CATEGORY_BORDER: Record<string, string> = {
  QA: "border-emerald-500/25",
  BA: "border-orange-500/25",
  DA: "border-violet-500/25",
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
  const comingSoon = Boolean(track.comingSoon);

  const card = (
      <article
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-md transition-all duration-300",
          comingSoon ? "opacity-75" : "hover:-translate-y-1 hover:bg-card/80 hover:shadow-xl",
          !comingSoon && category === "QA" ? "hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]" : "",
          !comingSoon && category === "BA" ? "hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)]" : "",
          !comingSoon && category === "DA" ? "hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]" : "",
          CATEGORY_BORDER[category] ?? "border-border/50 hover:border-border",
          !comingSoon && progress?.isStarted && progress.progressPercent < 100 ? "ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "",
          !comingSoon && progress?.progressPercent === 100 ? "ring-1 ring-emerald-500/30" : "",
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

            {comingSoon ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <LockKeyhole className="h-3 w-3" />
                Coming soon
              </span>
            ) : progress?.progressPercent === 100 ? (
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
          <h3 className={cn("text-lg font-bold leading-snug text-foreground transition-colors", !comingSoon && "group-hover:text-indigo-300")}>
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

        <div className="border-t border-border" />

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
                    CATEGORY_PROGRESS_BAR[category] ?? "bg-indigo-500",
                  )}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
              "border border-border/60 bg-muted/25",
              comingSoon ? "text-muted-foreground" : "text-foreground",
              !comingSoon && category === "QA" ? "group-hover:bg-emerald-500/10 group-hover:border-emerald-500/40 group-hover:text-emerald-400" : "",
              !comingSoon && category === "BA" ? "group-hover:bg-orange-500/10 group-hover:border-orange-500/40 group-hover:text-orange-400" : "",
              !comingSoon && category === "DA" ? "group-hover:bg-violet-500/10 group-hover:border-violet-500/40 group-hover:text-violet-400" : "",
              !comingSoon && !["QA", "BA", "DA"].includes(category) ? "group-hover:bg-indigo-500/10 group-hover:border-indigo-500/40 group-hover:text-indigo-300" : "",
            )}
          >
            {comingSoon
              ? "Скоро откроется"
              : progress?.progressPercent === 100
              ? "Повторить материал"
              : progress?.isStarted
                ? "Продолжить обучение"
                : "Начать трек"}
            {comingSoon ? <LockKeyhole className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </div>
        </div>
      </article>
  );

  if (comingSoon) {
    return (
      <div className="block h-full cursor-not-allowed" aria-disabled="true">
        {card}
      </div>
    );
  }

  return (
    <Link href={`/tracks/${track.slug}`} className="block h-full">
      {card}
    </Link>
  );
}
