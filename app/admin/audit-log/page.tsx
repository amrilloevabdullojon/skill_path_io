import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Audit Log — Admin",
  robots: { index: false },
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  UPDATE: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  DELETE: "border-red-400/30 bg-red-500/10 text-red-300",
  PUBLISH: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  ARCHIVE: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  LOGIN: "border-border bg-card text-muted-foreground",
};

function actionColor(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toUpperCase().includes(k));
  return key ? ACTION_COLORS[key] : "border-border bg-card text-muted-foreground";
}

export default async function AuditLogPage() {
  await requireAdminPermission("analytics.read");

  const t = await getTranslations("admin.auditLog");

  let logs: Awaited<ReturnType<typeof prisma.adminActivityLog.findMany>> = [];
  let total = 0;
  let error: string | null = null;

  try {
    [logs, total] = await Promise.all([
      prisma.adminActivityLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 100,
      }),
      prisma.adminActivityLog.count(),
    ]);
  } catch {
    error = t("error");
  }

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 sm:p-7">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="section-title">{t("title")}</h1>
        <p className="body-text text-sm">
          {t("description", { count: Math.min(100, total), total })}
        </p>
      </header>

      {error ? (
        <div className="surface-elevated rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="surface-elevated p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("columns.time")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("columns.actor")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">{t("columns.role")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("columns.action")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("columns.entity")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden xl:table-cell">{t("columns.note")}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={
                      idx % 2 === 0
                        ? "border-b border-border bg-background/30"
                        : "border-b border-border bg-card/20"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.timestamp.toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.actorEmail}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="chip-neutral">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="font-semibold">{log.entityType}</span>
                      {log.entityId && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          #{log.entityId.slice(-6)}
                        </span>
                      )}
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {log.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {logs.map((log) => (
              <article key={log.id} className="surface-subtle rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${actionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {log.timestamp.toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{log.actorEmail}</span>
                  <span className="chip-neutral">
                    {log.actorRole}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-semibold">{log.entityType}</span>
                  {log.entityId && (
                    <span className="font-mono text-muted-foreground">#{log.entityId.slice(-6)}</span>
                  )}
                </div>
                {log.note ? (
                  <p className="text-xs text-muted-foreground truncate">{log.note}</p>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
