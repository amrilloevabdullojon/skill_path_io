import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, FileText } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

type DashboardPortfolioPreviewProps = {
  totalEntries: number;
  missionArtifacts: number;
  recentEntryTitle: string | null;
};

export function DashboardPortfolioPreviewSection({
  totalEntries,
  missionArtifacts,
  recentEntryTitle,
}: DashboardPortfolioPreviewProps) {
  return (
    <DashboardSection
      id="portfolio"
      title="Portfolio Preview"
      description="Turn completed missions and learning milestones into career artifacts."
    >
      <article className="surface-panel-hover space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5">
            <p className="text-slate-500">Total entries</p>
            <p className="mt-1 text-base font-semibold text-slate-100">{totalEntries}</p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5">
            <p className="text-slate-500">Mission artifacts</p>
            <p className="mt-1 text-base font-semibold text-slate-100">{missionArtifacts}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 text-xs">
          <p className="text-slate-500">Latest artifact</p>
          <p className="mt-1 line-clamp-2 text-slate-200">{recentEntryTitle ?? "Complete a mission to create your first entry."}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/portfolio" className="btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Open portfolio
          </Link>
          <Link href="/portfolio" className="inline-flex items-center gap-1 text-xs text-sky-300 transition-colors hover:text-sky-200">
            <FileText className="h-3.5 w-3.5" />
            Export artifacts
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </DashboardSection>
  );
}
