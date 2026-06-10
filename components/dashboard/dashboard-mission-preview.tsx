import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Lock } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MissionPreviewItem = {
  id: string;
  title: string;
  scenario: string;
  xpReward: number;
  status: string;
};

type StatusMeta = {
  label: string;
  variant: BadgeProps["variant"];
  cardHover: string;
  cta: string;
  icon: React.ReactNode;
  isLocked: boolean;
};

function missionStatusMeta(status: string): StatusMeta {
  const normalized = status.toLowerCase();
  if (normalized === "in_progress") {
    return {
      label: "В процессе",
      variant: "default",
      cardHover: "hover:border-indigo-500/45",
      cta: "Продолжить",
      icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
      isLocked: false,
    };
  }
  if (normalized === "locked") {
    return {
      label: "Недоступно",
      variant: "secondary",
      cardHover: "opacity-80",
      cta: "Посмотреть условия",
      icon: <Lock className="h-3.5 w-3.5" />,
      isLocked: true,
    };
  }
  return {
    label: "Готово к старту",
    variant: "success",
    cardHover: "hover:border-emerald-500/45",
    cta: "Начать миссию",
    icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
    isLocked: false,
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

          return (
            <article
              key={mission.id}
              className={cn(
                "surface-elevated p-5 transition-colors",
                statusMeta.cardHover,
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 pr-4">
                  <p className="mb-2 text-base font-semibold leading-tight text-foreground">
                    {mission.title}
                  </p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {mission.scenario}
                  </p>
                </div>
                <Badge variant="accent" className="shrink-0">
                  +{mission.xpReward} XP
                </Badge>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Badge variant={statusMeta.variant} className="gap-1.5">
                  {statusMeta.icon}
                  {statusMeta.label}
                </Badge>

                <Link
                  href="/missions"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-xs font-semibold transition-colors",
                    statusMeta.isLocked
                      ? "border-border bg-muted/40 text-muted-foreground hover:bg-muted/60"
                      : "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20",
                  )}
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
