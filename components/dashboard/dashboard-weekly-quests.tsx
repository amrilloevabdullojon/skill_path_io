"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ProgressBar } from "@/components/ui/progress-bar";
import { WeeklyQuest } from "@/types/personalization";

export function DashboardWeeklyQuestsSection({ quests }: { quests: WeeklyQuest[] }) {
  const [items, setItems] = useState(quests);

  function progressQuest(id: string) {
    setItems((prev) =>
      prev.map((quest) => {
        if (quest.id !== id || quest.status === "completed") {
          return quest;
        }

        const progress = Math.min(quest.progress + 1, quest.goal);
        return {
          ...quest,
          progress,
          status: progress >= quest.goal ? "completed" : "in_progress",
        };
      }),
    );
  }

  return (
    <DashboardSection
      id="quests"
      title="Weekly Quests"
      description="Short challenges for consistency, XP rewards, and streak retention."
      actionLabel="Open missions"
      actionHref="/missions"
    >
      <div className="grid gap-3">
        {items.map((quest) => {
          const percent = Math.round((quest.progress / Math.max(quest.goal, 1)) * 100);
          return (
            <article key={quest.id} className="surface-panel-hover rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{quest.title}</p>
                  <p className="text-xs text-slate-400">{quest.description}</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  +{quest.rewardXp} XP
                </span>
              </div>
              <ProgressBar value={percent} className="mt-3" />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">{quest.progress}/{quest.goal} completed</p>
                {quest.status === "completed" ? (
                  <p className="inline-flex items-center gap-1 text-xs text-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </p>
                ) : (
                  <button type="button" onClick={() => progressQuest(quest.id)} className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Progress +1
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </DashboardSection>
  );
}
