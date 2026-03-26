import { Flame, Trophy } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { LevelBadge } from "@/components/level/level-badge";
import { WeeklyProgressChart } from "@/components/dashboard/weekly-progress-chart";
import type { DashboardData } from "@/lib/dashboard/data";

type DashboardXpLevelProps = {
  xp: DashboardData["xp"];
  weeklyProgress: DashboardData["weeklyProgress"];
};

export function DashboardXpLevelSection({ xp, weeklyProgress }: DashboardXpLevelProps) {
  return (
    <DashboardSection
      id="xp"
      title="XP, Level, and Growth"
      description="Track your progress towards the next level with lightweight weekly trend analytics."
    >
      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="mini-stat-box card-elevated min-w-0 space-y-4 rounded-2xl p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="kicker">Level progress</p>
              <p className="mt-1 bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
                {xp.totalXp} XP
              </p>
            </div>
            <LevelBadge level={xp.currentLevel} className="shrink-0 whitespace-nowrap" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>To next level</span>
              <span>{xp.progressPercent}%</span>
            </div>
            <div className="progress-track mt-2 h-2">
              <div className="progress-fill h-full rounded-full bg-sky-400" style={{ width: `${xp.progressPercent}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {xp.nextLevel ? `${xp.xpNeededForNext} XP to ${xp.nextLevel}` : "Maximum level reached"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 text-center text-xs sm:grid-cols-3">
            <div className="mini-stat-box p-2.5">
              <p className="text-muted-foreground">Streak</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Flame className="h-3.5 w-3.5 text-orange-300" />
                {xp.streak}
              </p>
            </div>
            <div className="mini-stat-box p-2.5">
              <p className="text-muted-foreground">Badges</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{xp.badgesCount}</p>
            </div>
            <div className="mini-stat-box p-2.5">
              <p className="text-muted-foreground">Weekly XP</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Trophy className="h-3.5 w-3.5 text-sky-300" />
                {xp.weeklyXp}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {xp.badges.length === 0 ? (
              <span className="chip-neutral px-2.5 py-1 text-xs text-muted-foreground">
                Complete a module to unlock first badge
              </span>
            ) : (
              xp.badges.map((badge) => (
                <span key={badge} className="chip-neutral px-2.5 py-1 text-xs">
                  {badge}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="content-card min-w-0 rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground">Weekly completion trend</p>
          <p className="mt-1 text-xs text-muted-foreground">Last 8 weeks of progress and finished modules</p>
          <div className="mt-4 min-w-0">
            <WeeklyProgressChart data={weeklyProgress} />
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
