import Link from "next/link";
import { ArrowRight, CircleDot, Rocket, Target, Zap } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardUpcomingAction } from "@/lib/dashboard/data";

type DashboardUpcomingActionsProps = {
  actions: DashboardUpcomingAction[];
};

function priorityClass(priority: DashboardUpcomingAction["priority"]) {
  if (priority === "High") {
    return "border-rose-500/40 bg-rose-500/20 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
  }
  if (priority === "Medium") {
    return "border-amber-500/40 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
  }
  return "border-border/50 bg-card/60 text-foreground/70";
}

function difficultyClass(difficulty: DashboardUpcomingAction["difficulty"]) {
  if (difficulty === "High") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-400";
  }
  if (difficulty === "Medium") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-400";
  }
  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
}

function translatePriority(priority: string) {
  if (priority === "High") return "Высокий";
  if (priority === "Medium") return "Средний";
  if (priority === "Low") return "Низкий";
  return priority;
}

function translateDifficulty(difficulty: string) {
  if (difficulty === "High") return "Сложно";
  if (difficulty === "Medium") return "Средне";
  if (difficulty === "Low") return "Легко";
  return difficulty;
}

export async function DashboardUpcomingActionsSection({ actions }: DashboardUpcomingActionsProps) {
  return (
    <DashboardSection
      id="actions"
      title="Ваш план обучения"
      description="Умные рекомендации и следующие шаги для развития навыков."
    >
      <div className="relative before:absolute before:inset-y-0 before:left-[17px] sm:before:left-[21px] before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-indigo-500/50 before:to-transparent before:z-0 space-y-6 lg:space-y-8 ml-2">
        {actions.map((action, _idx) => (
          <article
            key={action.id}
            className="group relative flex gap-4 sm:gap-6 z-10"
          >
            {/* Timeline Node */}
            <div className="relative mt-1 shrink-0">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-indigo-400/50 bg-background/80 shadow-[0_0_15px_rgba(99,102,241,0.4)] backdrop-blur-md">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 group-hover:scale-125 transition-transform duration-300" />
              </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 surface-elevated border border-border/40 bg-card/60 backdrop-blur-xl rounded-[24px] p-5 sm:p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[30px] rounded-full pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
              
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <p className="text-lg font-bold text-foreground">{action.title}</p>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${priorityClass(action.priority)}`}>
                      ПРИОРИТЕТ: {translatePriority(action.priority)}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${difficultyClass(action.difficulty)}`}>
                      {translateDifficulty(action.difficulty)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed">{action.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="bg-background/40 border border-border/40 rounded-xl px-3 py-2 flex items-center gap-2">
                    <CircleDot className="h-3.5 w-3.5 text-indigo-400" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-foreground/50 tracking-wider">Время</p>
                      <p className="font-semibold text-foreground">{action.eta}</p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/40 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-foreground/50 tracking-wider">Награда</p>
                      <p className="font-semibold text-amber-400">+{action.xpReward} XP</p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/40 rounded-xl px-3 py-2 flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                    <Target className="h-3.5 w-3.5 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase font-bold text-foreground/50 tracking-wider">Влияние на навык</p>
                      <p className="font-semibold text-foreground truncate">{action.skillImpact}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link 
                    href={action.href} 
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/link"
                  >
                    <Rocket className="h-4 w-4 text-indigo-500 group-hover/link:animate-bounce" />
                    Начать выполнение
                    <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
        {actions.length === 0 && (
           <p className="text-sm text-foreground/60 pl-14 pb-8">На данный момент нет предстоящих задач.</p>
        )}
      </div>
    </DashboardSection>
  );
}
