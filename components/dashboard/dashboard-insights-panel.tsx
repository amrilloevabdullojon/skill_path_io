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
    <div className="sticky top-24 max-h-[calc(100dvh-7rem)] min-w-0 space-y-4 overflow-y-auto pr-1 overscroll-contain [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/70 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
      <section className="surface-elevated surface-panel-hover space-y-3 p-4">
        <p className="text-sm font-semibold text-slate-100">Learning insights</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-2.5">
            <p className="text-slate-500">Your rank</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-100">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              {rank ? `#${rank}` : "N/A"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-2.5">
            <p className="text-slate-500">Weekly XP</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-100">
              <Flame className="h-3.5 w-3.5 text-orange-300" />
              {weeklyXp}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-2.5 text-xs">
          <p className="text-slate-500">Learning velocity</p>
          <p className="mt-1 text-slate-100">{velocity}% this week</p>
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
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Award className="h-4 w-4 text-emerald-300" />
          Achievements
        </p>
        <div className="space-y-2">
          {achievements.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{item.value}</p>
              <p className="text-[11px] text-slate-500">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-elevated surface-panel-hover space-y-3 p-4">
        <p className="text-sm font-semibold text-slate-100">Skill progress</p>
        <div className="space-y-2">
          {skillRadar.data.map((item) => (
            <div key={item.skill} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{item.skill}</span>
                <span className="text-slate-500">{item.value}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-sky-400/90 transition-all duration-500" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
          <p className="text-slate-500">Strongest: <span className="text-slate-200">{skillRadar.strongestSkill}</span></p>
          <p className="text-slate-500">Weakest: <span className="text-slate-200">{skillRadar.weakestSkill}</span></p>
          <p className="text-slate-500">Next focus: <span className="text-slate-200">{skillRadar.nextFocus}</span></p>
        </div>
      </section>
    </div>
  );
}
