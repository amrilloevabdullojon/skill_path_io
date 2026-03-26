import { Sparkles } from "lucide-react";

import { LevelBadge } from "@/components/level/level-badge";
import { LevelTier } from "@/lib/progress/xp";

type XpProgressCardProps = {
  totalXp: number;
  currentLevel: LevelTier;
  nextLevel: LevelTier | null;
  progressPercent: number;
  xpNeededForNext: number;
};

export function XpProgressCard({
  totalXp,
  currentLevel,
  nextLevel,
  progressPercent,
  xpNeededForNext,
}: XpProgressCardProps) {
  return (
    <article className="surface-panel space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Experience</p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">{totalXp} XP</h3>
        </div>
        <LevelBadge level={currentLevel} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress to next level</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress-track h-2">
          <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <p className="xp-pill inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
        <Sparkles className="h-4 w-4 text-sky-300" />
        {nextLevel ? `${xpNeededForNext} XP to ${nextLevel}` : "Maximum level reached"}
      </p>
    </article>
  );
}
