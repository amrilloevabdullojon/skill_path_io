import Link from "next/link";
import { MessageSquare, Timer } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

export async function DashboardInterviewPracticeSection() {
  const t = await getTranslations("dashboard.interviewPractice");

  return (
    <DashboardSection
      id="interview-practice"
      title={t("title")}
      description={t("description")}
      actionLabel={t("startAction")}
      actionHref="/interview"
    >
      <article className="surface-subtle space-y-3 p-4">
        <p className="text-sm font-semibold text-foreground">{t("trainerTitle")}</p>
        <p className="text-xs text-muted-foreground">{t("trainerDescription")}</p>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <p className="data-pill inline-flex items-center gap-1 p-2">
            <Timer className="select-chevron h-3.5 w-3.5" />
            {t("sessionDuration")}
          </p>
          <p className="data-pill inline-flex items-center gap-1 p-2">
            <MessageSquare className="select-chevron h-3.5 w-3.5" />
            {t("aiFeedback")}
          </p>
        </div>
        <Link href="/interview" className="btn-secondary inline-flex">
          {t("openButton")}
        </Link>
      </article>
    </DashboardSection>
  );
}
