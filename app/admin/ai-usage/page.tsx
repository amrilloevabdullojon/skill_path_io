import { Activity, CalendarClock, CalendarDays } from "lucide-react";

import { StudioKpiCard } from "@/components/admin/studio-kpi-card";
import { requireAdminPermission } from "@/lib/admin-auth";
import { buildAiUsageSummary } from "@/lib/admin/ai-usage";

export const dynamic = "force-dynamic";

export default async function AiUsageAdminPage() {
  await requireAdminPermission("analytics.read");

  const summary = await buildAiUsageSummary();

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 text-foreground">
        <h2 className="section-title">AI usage</h2>
        <p className="text-sm text-muted-foreground">
          AI call volume from <code>AiUsageLog</code>, for cost monitoring.
        </p>
        <p className="text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StudioKpiCard
          label="Total AI calls"
          value={summary.totalCalls}
          helper="All time"
          icon={<Activity className="h-4 w-4" />}
          accent="violet"
        />
        <StudioKpiCard
          label="Last 7 days"
          value={summary.last7Days}
          icon={<CalendarClock className="h-4 w-4" />}
          accent="sky"
        />
        <StudioKpiCard
          label="Last 30 days"
          value={summary.last30Days}
          icon={<CalendarDays className="h-4 w-4" />}
          accent="emerald"
        />
      </div>

      <section className="surface-elevated space-y-4 p-5 text-foreground">
        <h3 className="text-lg font-semibold">Calls by feature</h3>
        <div className="table-shell">
          <table className="table-base min-w-[420px]">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-3">Feature</th>
                <th className="px-3 py-3">Calls</th>
                <th className="px-3 py-3">Share</th>
              </tr>
            </thead>
            <tbody>
              {summary.byFeature.map((row) => {
                const share =
                  summary.totalCalls > 0
                    ? Math.round((row.count / summary.totalCalls) * 100)
                    : 0;
                return (
                  <tr key={row.feature} className="table-row">
                    <td className="px-3 py-3">{row.feature}</td>
                    <td className="px-3 py-3">{row.count}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${Math.max(share, 2)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {summary.byFeature.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={3}>
                    No AI calls logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
