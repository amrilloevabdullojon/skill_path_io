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
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">{totalXp} XP</h3>
        </div>
        <LevelBadge level={currentLevel} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Progress to next level</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <p className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
        <Sparkles className="h-4 w-4 text-sky-300" />
        {nextLevel ? `${xpNeededForNext} XP to ${nextLevel}` : "Maximum level reached"}
      </p>
    </article>
  );
}
