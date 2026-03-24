import { LevelTier } from "@/lib/progress/xp";
import { cn } from "@/lib/utils";

type LevelBadgeProps = {
  level: LevelTier;
  className?: string;
};

const levelStyles: Record<LevelTier, string> = {
  Beginner: "border-slate-600 bg-slate-700/60 text-slate-100",
  Explorer: "border-sky-400/40 bg-sky-500/15 text-sky-200",
  Professional: "border-violet-400/40 bg-violet-500/15 text-violet-200",
  Expert: "border-orange-400/40 bg-orange-500/15 text-orange-200",
  Master: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
};

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        levelStyles[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
