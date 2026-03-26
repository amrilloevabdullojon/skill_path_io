import Link from "next/link";
import { TrackCategory } from "@prisma/client";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardData } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

type DashboardSkillTreePreviewProps = {
  skillTree: DashboardData["skillTree"];
};

const categoryChip: Record<TrackCategory, string> = {
  QA: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
  BA: "border-orange-400/35 bg-orange-500/15 text-orange-200",
  DA: "border-violet-400/35 bg-violet-500/15 text-violet-200",
};

export function DashboardSkillTreePreviewSection({ skillTree }: DashboardSkillTreePreviewProps) {
  return (
    <DashboardSection
      id="tree"
      title="Skill Tree Preview"
      description="Unlocked branches, locked nodes, and the next skill milestone."
      actionLabel="Open full skill tree"
      actionHref="/career"
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Unlocked</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{skillTree.unlockedCount}</p>
          </div>
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Total nodes</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{skillTree.totalCount}</p>
          </div>
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Nearest unlock</p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">{skillTree.nextUnlock ?? "All unlocked"}</p>
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
          Open full skill tree
        </Link>
      </div>
    </DashboardSection>
  );
}
