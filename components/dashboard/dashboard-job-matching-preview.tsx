import Link from "next/link";
import { ArrowUpRight, Briefcase } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

type JobPreview = {
  id: string;
  title: string;
  matchPercent: number;
  missingRequirements: string[];
};

export function DashboardJobMatchingPreviewSection({ jobs }: { jobs: JobPreview[] }) {
  return (
    <DashboardSection id="jobs" title="Job Matching Preview" description="Top roles aligned to your current skill profile.">
      <div className="space-y-2">
        {jobs.slice(0, 3).map((job) => (
          <article key={job.id} className="surface-panel-hover rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-100">{job.title}</p>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">{job.matchPercent}%</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Missing: {job.missingRequirements.slice(0, 2).join(", ") || "None"}</p>
          </article>
        ))}
      </div>
      <Link href="/jobs" className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200">
        <Briefcase className="h-3.5 w-3.5" />
        Open jobs
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </DashboardSection>
  );
}
