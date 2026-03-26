import Link from "next/link";
import { ArrowUpRight, Award, Flame, Trophy } from "lucide-react";
import type { DashboardAchievement, DashboardData } from "@/lib/dashboard/data";

type DashboardInsightsPanelProps = {
  achievements: DashboardAchievement[];
  weeklyProgress: DashboardData["weeklyProgress"];
  rank: number | null;
  weeklyXp: number;
  skillRadar: DashboardData["skillRadar"];
};

export function DashboardInsightsPanel({ achievements, weeklyProgress, rank, weeklyXp, skillRadar }: DashboardInsightsPanelProps) {
  const lastWeek = weeklyProgress[weeklyProgress.length - 1];
  const previousWeek = weeklyProgress[weeklyProgress.length - 2];
  const velocity = Math.max(0, (lastWeek?.progress ?? 0) - (previousWeek?.progress ?? 0));

  return (
    <div className="sticky top-24 max-h-[calc(100dvh-7rem)] min-w-0 space-y-4 overflow-y-auto pr-1 overscroll-contain [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
      <section className="surface-elevated surface-panel-hover space-y-3 p-4">
        <p className="text-sm font-semibold text-foreground">Learning insights</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="mini-stat-box p-2.5">
            <p className="text-muted-foreground">Your rank</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              {rank ? `#${rank}` : "N/A"}
            </p>
          </div>
          <div className="mini-stat-box p-2.5">
            <p className="text-muted-foreground">Weekly XP</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Flame className="h-3.5 w-3.5 text-orange-300" />
              {weeklyXp}
            </p>
          </div>
        </div>
        <div className="mini-stat-box p-2.5 text-xs">
          <p className="text-muted-foreground">Learning velocity</p>
          <p className="mt-1 text-foreground">{velocity}% this week</p>
        </div>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 transition-colors hover:text-sky-200"
        >
          Open leaderboard
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      <section className="surface-elevated surface-panel-hover space-y-3 p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Award className="h-4 w-4 text-emerald-300" />
          Achievements
        </p>
        <div className="space-y-2">
          {achievements.map((item) => (
            <article key={item.id} className="content-card p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-elevated surface-panel-hover space-y-3 p-4">
        <p className="text-sm font-semibold text-foreground">Skill progress</p>
        <div className="space-y-2">
          {skillRadar.data.map((item) => (
            <div key={item.skill} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.skill}</span>
                <span className="text-muted-foreground">{item.value}%</span>
              </div>
              <div className="progress-track h-1.5">
                <div className="h-full rounded-full bg-sky-400/90 transition-all duration-500" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="content-card p-3 text-xs">
          <p className="text-muted-foreground">Strongest: <span className="text-foreground">{skillRadar.strongestSkill}</span></p>
          <p className="text-muted-foreground">Weakest: <span className="text-foreground">{skillRadar.weakestSkill}</span></p>
          <p className="text-muted-foreground">Next focus: <span className="text-foreground">{skillRadar.nextFocus}</span></p>
        </div>
      </section>
    </div>
  );
}
