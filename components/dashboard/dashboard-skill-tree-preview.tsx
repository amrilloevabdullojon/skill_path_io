import Link from "next/link";
import { TrackCategory } from "@prisma/client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardData } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

type DashboardSkillTreePreviewProps = {
  skillTree: DashboardData["skillTree"];
};

const categoryChip: Record<TrackCategory, string> = {
  QA: "track-badge-qa",
  BA: "track-badge-ba",
  DA: "track-badge-da",
};

export function DashboardSkillTreePreviewSection({ skillTree }: DashboardSkillTreePreviewProps) {
  return (
    <DashboardSection
      id="tree"
      title="Дерево навыков"
      description="Открытые ветки, заблокированные узлы и ближайший ориентир."
      actionLabel="Открыть дерево навыков"
      actionHref="/career"
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Открыто</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{skillTree.unlockedCount}</p>
          </div>
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Всего узлов</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{skillTree.totalCount}</p>
          </div>
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Ближайшее открытие</p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">{skillTree.nextUnlock ?? "Всё открыто"}</p>
          </div>
        </div>

        <div className="space-y-2">
          {skillTree.branches.map((branch) => (
            <article key={branch.id} className="content-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{branch.title}</p>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    categoryChip[branch.category],
                  )}
                >
                  {branch.category}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {branch.unlocked.map((skill) => (
                  <span key={`${branch.id}-unlocked-${skill}`} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                    {skill}
                  </span>
                ))}
                {branch.locked.map((skill) => (
                  <span key={`${branch.id}-locked-${skill}`} className="skill-tag px-2 py-0.5 text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <Link
          href="/career"
          className="btn-secondary text-sm"
        >
          Открыть дерево навыков
        </Link>
      </div>
    </DashboardSection>
  );
}
