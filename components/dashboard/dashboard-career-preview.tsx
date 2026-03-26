import Link from "next/link";
import { ArrowUpRight, Briefcase } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import type { DashboardData } from "@/lib/dashboard/data";

type DashboardCareerPreviewProps = {
  career: DashboardData["career"];
};

export function DashboardCareerPreviewSection({ career }: DashboardCareerPreviewProps) {
  return (
    <DashboardSection
      id="career"
      title="Career Roadmap Preview"
      description="Your current stage, progress to next stage, and missing skills to prioritize."
      actionLabel="Open career roadmap"
      actionHref="/career"
    >
      <div className="space-y-4">
        <div className="mini-stat-box rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Briefcase className="h-4 w-4 text-sky-300" />
            {career.currentStage} stage
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {career.nextStage ? `Target: ${career.nextStage}` : "Senior stage reached"}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress to next stage</span>
              <span>{career.progressToNextStage}%</span>
            </div>
            <div className="progress-track mt-2 h-2">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-500"
                style={{ width: `${career.progressToNextStage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="content-card p-4">
          <p className="data-label">Missing skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {career.missingSkills.length === 0 ? (
              <span className="skill-tag px-3 py-1 text-xs">
                Skills are balanced
              </span>
            ) : (
              career.missingSkills.map((skill) => (
                <span key={skill} className="skill-tag px-3 py-1 text-xs">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        <Link
          href="/career"
          className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 transition-colors hover:text-sky-200"
        >
          Open full roadmap
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </DashboardSection>
  );
}
