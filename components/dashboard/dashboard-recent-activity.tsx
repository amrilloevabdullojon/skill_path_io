import { Award, BookOpenCheck, CheckCircle2, Medal, Sparkles, Timer } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardActivityItem } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

type DashboardRecentActivityProps = {
  activity: DashboardActivityItem[];
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function activityIcon(item: DashboardActivityItem["kind"]) {
  if (item === "lesson") {
    return <BookOpenCheck className="h-4 w-4 text-sky-300" />;
  }
  if (item === "quiz") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  }
  if (item === "skill") {
    return <Sparkles className="h-4 w-4 text-violet-300" />;
  }
  if (item === "badge") {
    return <Medal className="h-4 w-4 text-amber-300" />;
  }
  if (item === "simulation") {
    return <Timer className="h-4 w-4 text-cyan-300" />;
  }
  return <Award className="h-4 w-4 text-orange-300" />;
}

export function DashboardRecentActivitySection({ activity }: DashboardRecentActivityProps) {
  return (
    <DashboardSection
      id="activity"
      title="Recent Activity"
      description="Timeline of lessons, quizzes, skill unlocks, badges, and milestones."
    >
      <div className="space-y-3">
        {activity.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
            No activity yet. Open a module to start building your timeline.
          </p>
        ) : (
          activity.map((item) => (
            <article
              key={item.id}
              className="surface-panel-hover relative rounded-xl border border-slate-800 bg-slate-950/70 p-4 pl-12"
            >
              <span
                className={cn(
                  "absolute left-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80",
                )}
              >
                {activityIcon(item.kind)}
              </span>
              <p className="text-sm font-semibold text-slate-100">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.description}</p>
              <p className="mt-2 text-[11px] text-slate-500">{formatDateTime(item.timestamp)}</p>
            </article>
          ))
        )}
      </div>
    </DashboardSection>
  );
}
