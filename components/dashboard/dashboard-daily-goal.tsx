import { CheckCircle2, Target } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ProgressBar } from "@/components/ui/progress-bar";

type DashboardDailyGoalProps = {
  goal: {
    targetLessons: number;
    completedLessons: number;
    targetXp: number;
    earnedXp: number;
  };
};

export function DashboardDailyGoalSection({ goal }: DashboardDailyGoalProps) {
  const lessonsPercent = Math.round((goal.completedLessons / Math.max(goal.targetLessons, 1)) * 100);
  const xpPercent = Math.round((goal.earnedXp / Math.max(goal.targetXp, 1)) * 100);
  const isCompleted = goal.completedLessons >= goal.targetLessons;

  return (
    <DashboardSection
      id="daily-goal"
      title="Daily learning goal"
      description="Stay consistent with compact daily milestones."
    >
      <article className="surface-subtle surface-panel-hover space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Target className="h-4 w-4 text-sky-300" />
            {goal.targetLessons} lessons today
          </p>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              isCompleted
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                : "border-slate-700 bg-slate-900/80 text-slate-300"
            }`}
          >
            {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {isCompleted ? "Completed" : "In progress"}
          </span>
        </div>
        <ProgressBar value={lessonsPercent} label={`${goal.completedLessons}/${goal.targetLessons} completed`} />
        <ProgressBar
          value={xpPercent}
          fillClassName="bg-emerald-400"
          label={`${goal.earnedXp}/${goal.targetXp} XP`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="text-slate-400">
            Reward: <span className="font-semibold text-emerald-200">+{goal.targetXp} XP</span>
          </p>
          <p className="text-slate-500">{Math.max(0, goal.targetLessons - goal.completedLessons)} lessons remaining</p>
        </div>
      </article>
    </DashboardSection>
  );
}
