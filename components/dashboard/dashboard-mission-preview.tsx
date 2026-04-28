import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Lock } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { cn } from "@/lib/utils";

type MissionPreviewItem = {
  id: string;
  title: string;
  scenario: string;
  xpReward: number;
  status: string;
};

function missionStatusMeta(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "in_progress") {
    return {
      label: "В процессе",
      chip: "border-indigo-500/40 bg-indigo-500/20 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
      card: "border-indigo-500/30 hover:border-indigo-500/50 bg-card/60 backdrop-blur-md shadow-[0_4px_20px_rgba(99,102,241,0.05)]",
      cta: "Продолжить",
      icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
    };
  }
  if (normalized === "locked") {
    return {
      label: "Недоступно",
      chip: "border-slate-600/40 bg-slate-800/50 text-slate-400",
      card: "border-border/40 bg-card/40 backdrop-blur-md opacity-80",
      cta: "Посмотреть условия",
      icon: <Lock className="h-3.5 w-3.5" />,
    };
  }
  return {
    label: "Готово к старту",
    chip: "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    card: "border-emerald-500/30 hover:border-emerald-500/50 bg-card/60 backdrop-blur-md shadow-[0_4px_20px_rgba(16,185,129,0.05)]",
    cta: "Начать миссию",
    icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
  };
}

export function DashboardMissionPreviewSection({ missions }: { missions: MissionPreviewItem[] }) {
  return (
    <DashboardSection 
      id="missions" 
      title="Миссии" 
      description="Практические сценарии из реальной работы для портфолио."
    >
      <div className="space-y-3">
        {missions.map((mission) => {
          const statusMeta = missionStatusMeta(mission.status);
          const isLocked = mission.status.toLowerCase() === "locked";

          return (
            <article 
              key={mission.id} 
              className={cn(
                "relative overflow-hidden p-5 rounded-[20px] transition-all duration-300 group hover:-translate-y-0.5", 
                statusMeta.card
              )}
            >
              {!isLocked && (
                <div className="absolute top-0 right-[-10%] w-[100px] h-[100px] rounded-full blur-[30px] pointer-events-none transition-opacity opacity-30 group-hover:opacity-70 bg-indigo-500/20" />
              )}

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="min-w-0 pr-4">
                  <p className="text-base font-bold text-foreground drop-shadow-sm leading-tight mb-2">{mission.title}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/70">{mission.scenario}</p>
                </div>
                <span className="shrink-0 rounded-full border border-violet-500/40 bg-violet-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  +{mission.xpReward} XP
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 relative z-10">
                <p className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest", statusMeta.chip)}>
                  {statusMeta.icon}
                  {statusMeta.label}
                </p>

                <Link
                  href="/missions"
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition-colors rounded-lg border ${
                    isLocked 
                      ? "text-slate-400 border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60" 
                      : "text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-300"
                  }`}
                >
                  {statusMeta.cta}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
        {missions.length === 0 && (
           <p className="text-sm text-foreground/60 pl-1">Нет доступных сценариев на этом уровне.</p>
        )}
      </div>
    </DashboardSection>
  );
}
