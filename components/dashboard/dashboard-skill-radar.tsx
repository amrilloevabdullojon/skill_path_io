import { ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { SkillRadarChart } from "@/components/skill-radar/skill-radar";
import type { DashboardSkillRadar } from "@/lib/dashboard/data";

type DashboardSkillRadarProps = {
  radar: DashboardSkillRadar;
};

export function DashboardSkillRadarSection({ radar }: DashboardSkillRadarProps) {
  return (
    <DashboardSection
      id="skills"
      title="Skill Radar"
      description="Current competency across testing, analytics, communication, and automation."
    >
      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <div className="min-w-0">
          <SkillRadarChart data={radar.data} />
        </div>

        <aside className="grid min-w-0 gap-3 sm:grid-cols-3 2xl:grid-cols-1">
          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
              Strongest
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-100">{radar.strongestSkill}</p>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <TrendingDown className="h-3.5 w-3.5 text-orange-300" />
              Weakest
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-100">{radar.weakestSkill}</p>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
              Next focus
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-100">{radar.nextFocus}</p>
          </div>
        </aside>
      </div>
    </DashboardSection>
  );
}
