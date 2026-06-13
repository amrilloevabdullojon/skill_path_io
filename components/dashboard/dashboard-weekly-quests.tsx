"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, Trophy } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Badge } from "@/components/ui/badge";
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
      title="Еженедельные квесты"
      description="Выполняйте квесты до воскресенья, чтобы получить бонусный опыт."
      actionLabel="Больше миссий"
      actionHref="/missions"
    >
      <div className="grid gap-4">
        {items.map((quest) => {
          const percent = Math.round((quest.progress / Math.max(quest.goal, 1)) * 100);
          const isCompleted = quest.status === "completed";

          return (
            <article 
              key={quest.id} 
              className={`relative overflow-hidden surface-elevated border bg-card p-5 rounded-2xl transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:-translate-y-1 ${
                isCompleted 
                  ? "border-emerald-500/30 hover:border-emerald-500/50" 
                  : "border-indigo-500/20 hover:border-indigo-500/40"
              }`}
            >
              <div className={`absolute top-[-50%] right-[-10%] w-[150px] h-[150px] rounded-full blur-[40px] pointer-events-none transition-opacity ${
                isCompleted ? "bg-emerald-500/10 opacity-100" : "bg-indigo-500/5 opacity-50 group-hover:opacity-100"
              }`} />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                <div className="flex gap-4">
                  <div className={`shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl border shadow-inner ${
                    isCompleted 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  }`}>
                    {isCompleted ? <Trophy className="h-6 w-6 drop-shadow-sm" /> : <Sparkles className="h-6 w-6 drop-shadow-sm" />}
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground drop-shadow-sm">{quest.title}</p>
                    <p className="text-xs text-foreground/70 mt-1 max-w-[250px]">{quest.description}</p>
                  </div>
                </div>
                <div className="flex shrink-0 justify-end">
                  <Badge variant={isCompleted ? "success" : "warning"}>+{quest.rewardXp} XP</Badge>
                </div>
              </div>

              <div className="mt-5 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground/60 uppercase tracking-widest">
                  <span>{quest.progress} / {quest.goal} Выполнено</span>
                  <span className={isCompleted ? "text-emerald-400" : "text-indigo-400"}>{percent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800/50 rounded-full border border-slate-700/50 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      isCompleted 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        : "bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end relative z-10">
                {isCompleted ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Квест завершен
                  </p>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => progressQuest(quest.id)} 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg border border-indigo-500/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    Симулировать Прогресс
                  </button>
                )}
              </div>
            </article>
          );
        })}
        {items.length === 0 && (
           <p className="text-sm text-foreground/60 pl-1">Нет активных квестов.</p>
        )}
      </div>
    </DashboardSection>
  );
}
