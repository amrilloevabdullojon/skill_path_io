import { getTranslations } from "next-intl/server";

import { WeeklyAiReport } from "@/types/saas";

type WeeklyAiReportCardProps = {
  report: WeeklyAiReport;
};

export async function WeeklyAiReportCard({ report }: WeeklyAiReportCardProps) {
  const t = await getTranslations("dashboard.weeklyReport");

  return (
    <section id="report" className="surface-elevated space-y-4 p-5">
      <h2 className="section-title">{report.headline}</h2>
      <p className="text-sm text-muted-foreground">{report.summary}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {report.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100">
        {t("nextFocus")} {report.nextFocus}
      </p>
    </section>
  );
}
