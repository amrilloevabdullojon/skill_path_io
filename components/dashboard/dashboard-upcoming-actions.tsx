import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardUpcomingAction } from "@/lib/dashboard/data";

type DashboardUpcomingActionsProps = {
  actions: DashboardUpcomingAction[];
};

function priorityClass(priority: DashboardUpcomingAction["priority"]) {
  if (priority === "High") {
    return "border-rose-400/35 bg-rose-500/15 text-rose-200";
  }
  if (priority === "Medium") {
    return "border-amber-400/35 bg-amber-500/15 text-amber-200";
  }
  return "border-slate-600 bg-slate-800/70 text-slate-200";
}

function difficultyClass(difficulty: DashboardUpcomingAction["difficulty"]) {
  if (difficulty === "High") {
    return "border-rose-400/35 bg-rose-500/12 text-rose-200";
  }
  if (difficulty === "Medium") {
    return "border-amber-400/35 bg-amber-500/12 text-amber-200";
  }
  return "border-emerald-400/35 bg-emerald-500/12 text-emerald-200";
}

export function DashboardUpcomingActionsSection({ actions }: DashboardUpcomingActionsProps) {
  return (
    <DashboardSection
      id="actions"
      title="Suggested Next Actions"
      description="Actionable tasks to keep your learning velocity high this week."
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {actions.map((action) => (
          <article
            key={action.id}
            className="surface-panel-hover space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-100">{action.title}</p>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityClass(action.priority)}`}>
                  {action.priority}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${difficultyClass(action.difficulty)}`}>
                  Difficulty: {action.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400">{action.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <p className="rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5">Time: {action.eta}</p>
              <p className="rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5">+{action.xpReward} XP</p>
              <p className="col-span-2 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5">
                Skill impact: {action.skillImpact}
              </p>
            </div>
            <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 transition-colors hover:text-sky-200">
              <CircleDot className="h-4 w-4" />
              Start
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </DashboardSection>
  );
}
