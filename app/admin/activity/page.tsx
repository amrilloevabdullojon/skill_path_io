import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Activity Log — Admin",
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
  const key = Object.keys(ACTION_COLORS).find((k) =>
    action.toUpperCase().includes(k),
  );
  return key
    ? ACTION_COLORS[key]
    : "border-border bg-card text-muted-foreground";
}

type ActivityAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    entityType?: string | string[];
    action?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ActivityAdminPage({
  searchParams,
}: ActivityAdminPageProps) {
  await requireAdminPermission("analytics.read");

  const q = paramValue(searchParams?.q);
  const entityTypeFilter = paramValue(searchParams?.entityType);
  const actionFilter = paramValue(searchParams?.action);

  const where = {
    ...(q ? { actorEmail: { contains: q, mode: "insensitive" as const } } : {}),
    ...(entityTypeFilter ? { entityType: { contains: entityTypeFilter, mode: "insensitive" as const } } : {}),
    ...(actionFilter ? { action: { contains: actionFilter, mode: "insensitive" as const } } : {}),
  };

  let logs: Awaited<ReturnType<typeof prisma.adminActivityLog.findMany>> = [];
  let total = 0;
  let error: string | null = null;

  try {
    [logs, total] = await Promise.all([
      prisma.adminActivityLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: 100,
      }),
      prisma.adminActivityLog.count(),
    ]);
  } catch {
    error = "Failed to load activity log. The database may be unavailable.";
  }

  // Collect distinct entity types and actions for filter dropdowns
  let entityTypes: string[] = [];
  let actions: string[] = [];
  try {
    const [entityTypeRows, actionRows] = await Promise.all([
      prisma.adminActivityLog.findMany({
        select: { entityType: true },
        distinct: ["entityType"],
        orderBy: { entityType: "asc" },
      }),
      prisma.adminActivityLog.findMany({
        select: { action: true },
        distinct: ["action"],
        orderBy: { action: "asc" },
      }),
    ]);
    entityTypes = entityTypeRows.map((r) => r.entityType);
    actions = actionRows.map((r) => r.action);
  } catch {
    // Filters will just be empty if this fails
  }

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Security & Compliance"
        title="Activity Log"
        description={
          error
            ? "Failed to load log data."
            : `Showing latest ${Math.min(100, logs.length)} of ${total} events.`
        }
        aside={
          <a
            href="/api/admin/export/activity"
            className="btn-secondary text-sm"
            download
          >
            Export CSV
          </a>
        }
      />

      {/* Filter bar */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by actor email…"
            className="input-base"
          />
          <select
            name="entityType"
            defaultValue={entityTypeFilter}
            className="select-base"
          >
            <option value="">All entity types</option>
            {entityTypes.map((et) => (
              <option key={et} value={et}>
                {et}
              </option>
            ))}
          </select>
          <select
            name="action"
            defaultValue={actionFilter}
            className="select-base"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            Apply
          </button>
        </form>
      </section>

      {/* Content */}
      {error ? (
        <div className="surface-elevated rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="surface-elevated p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {q || entityTypeFilter || actionFilter
              ? "No activity log entries match the current filters."
              : "No activity log entries yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Actor Email
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Entity Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Entity ID
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground xl:table-cell">
                    Note
                  </th>
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
                      {log.timestamp.toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.actorEmail}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="chip-neutral">{log.actorRole}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${actionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {log.entityType}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.entityId ? `#${log.entityId.slice(-8)}` : "—"}
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {log.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {logs.map((log) => (
              <article
                key={log.id}
                className="surface-subtle rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${actionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {log.timestamp.toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {log.actorEmail}
                  </span>
                  <span className="chip-neutral">{log.actorRole}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-semibold">{log.entityType}</span>
                  {log.entityId && (
                    <span className="font-mono text-muted-foreground">
                      #{log.entityId.slice(-8)}
                    </span>
                  )}
                </div>
                {log.note ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {log.note}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
