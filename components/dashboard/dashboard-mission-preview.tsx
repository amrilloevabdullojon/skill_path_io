import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

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
      label: "In progress",
      chip: "border-sky-400/35 bg-sky-500/15 text-sky-200",
      card: "border-slate-800 bg-slate-950/70",
      cta: "Continue mission",
    };
  }
  if (normalized === "locked") {
    return {
      label: "Locked",
      chip: "border-slate-700 bg-slate-800/70 text-slate-400",
      card: "border-slate-800/80 bg-slate-950/45",
      cta: "View requirements",
    };
  }
  return {
    label: "Available",
    chip: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
    card: "border-slate-800 bg-slate-950/70",
    cta: "Start mission",
  };
}

export function DashboardMissionPreviewSection({ missions }: { missions: MissionPreviewItem[] }) {
  return (
    <DashboardSection id="missions" title="Mission Preview" description="Real-work missions to apply skills under scenario context.">
      <div className="space-y-2.5">
        {missions.map((mission) => {
          const statusMeta = missionStatusMeta(mission.status);
          return (
            <article key={mission.id} className={cn("surface-panel-hover rounded-xl border p-3.5", statusMeta.card)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">{mission.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-400">{mission.scenario}</p>
                </div>
                <span className="shrink-0 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-200">
                  +{mission.xpReward} XP
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", statusMeta.chip)}>
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  {statusMeta.label}
                </p>

                <Link
                  href="/missions"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-sky-300 transition-colors hover:border-slate-600 hover:text-sky-200"
                >
                  {statusMeta.cta}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </DashboardSection>
  );
}
