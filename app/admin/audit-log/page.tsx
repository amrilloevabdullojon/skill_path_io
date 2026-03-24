import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PermissionRoleType } from "@prisma/client";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  UPDATE: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  DELETE: "border-red-400/30 bg-red-500/10 text-red-300",
  PUBLISH: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  ARCHIVE: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  LOGIN: "border-slate-600/40 bg-slate-700/20 text-slate-400",
};

function actionColor(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toUpperCase().includes(k));
  return key ? ACTION_COLORS[key] : "border-slate-600/40 bg-slate-700/20 text-slate-400";
}

export default async function AuditLogPage() {
  await requireAdminPermission("analytics.read");

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
    error = "Could not load audit logs. The database may be unavailable.";
  }

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 sm:p-7">
        <p className="kicker">Security & Compliance</p>
        <h1 className="section-title text-2xl">Audit Log</h1>
        <p className="body-text text-sm">
          All admin actions are recorded here. Showing the latest {Math.min(100, total)} of {total} events.
        </p>
      </header>

      {error ? (
        <div className="surface-elevated rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="surface-elevated p-8 text-center">
          <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-800 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Actor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400 hidden lg:table-cell">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400 hidden xl:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={
                      idx % 2 === 0
                        ? "border-b border-slate-800/50 bg-slate-950/30"
                        : "border-b border-slate-800/50 bg-slate-900/20"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      {log.timestamp.toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{log.actorEmail}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="rounded border border-slate-700 bg-slate-800/50 px-1.5 py-0.5 text-xs text-slate-400">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      <span className="font-semibold">{log.entityType}</span>
                      {log.entityId && (
                        <span className="ml-1 font-mono text-xs text-slate-500">
                          #{log.entityId.slice(-6)}
                        </span>
                      )}
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-xs text-slate-500 xl:table-cell">
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
                  <span className="font-mono text-xs text-slate-500">
                    {log.timestamp.toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-300">{log.actorEmail}</span>
                  <span className="rounded border border-slate-700 bg-slate-800/50 px-1.5 py-0.5 text-xs text-slate-400">
                    {log.actorRole}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-300">
                  <span className="font-semibold">{log.entityType}</span>
                  {log.entityId && (
                    <span className="font-mono text-slate-500">#{log.entityId.slice(-6)}</span>
                  )}
                </div>
                {log.note ? (
                  <p className="text-xs text-slate-500 truncate">{log.note}</p>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
