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
      title="Карьерный план"
      description="Текущий этап, прогресс до следующего и навыки для приоритетной прокачки."
      actionLabel="Открыть карьерный план"
      actionHref="/career"
    >
      <div className="space-y-4">
        <div className="mini-stat-box rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Briefcase className="h-4 w-4 text-indigo-300" />
            Этап: {career.currentStage}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {career.nextStage ? `Цель: ${career.nextStage}` : "Достигнут уровень Senior"}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Прогресс до следующего этапа</span>
              <span>{career.progressToNextStage}%</span>
            </div>
            <div className="progress-track mt-2 h-2">
              <div
                className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                style={{ width: `${career.progressToNextStage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="content-card p-4">
          <p className="data-label">Недостающие навыки</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {career.missingSkills.length === 0 ? (
              <span className="skill-tag px-3 py-1 text-xs">
                Навыки сбалансированы
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
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
        >
          Открыть полный план
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </DashboardSection>
  );
}
