import { WeeklyAiReport } from "@/types/saas";

type WeeklyAiReportCardProps = {
  report: WeeklyAiReport;
};

export function WeeklyAiReportCard({ report }: WeeklyAiReportCardProps) {
  return (
    <section id="report" className="surface-elevated space-y-4 p-5">
      <h2 className="section-title">{report.headline}</h2>
      <p className="text-sm text-muted-foreground">{report.summary}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {report.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-100">
        Next focus: {report.nextFocus}
      </p>
    </section>
  );
}
