import { LevelTier } from "@/lib/progress/xp";
import { cn } from "@/lib/utils";

type LevelBadgeProps = {
  level: LevelTier;
  className?: string;
};

const levelStyles: Record<LevelTier, string> = {
  Beginner: "level-beginner",
  Explorer: "level-explorer",
  Professional: "level-professional",
  Expert: "level-expert",
  Master: "level-master",
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
