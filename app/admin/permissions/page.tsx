import { getTranslations } from "next-intl/server";
import { PermissionRoleType } from "@prisma/client";

import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const ROLE_COLORS: Record<PermissionRoleType, string> = {
  SUPER_ADMIN: "border-red-400/35 bg-red-500/15 text-red-200",
  CONTENT_ADMIN: "border-orange-400/35 bg-orange-500/15 text-orange-200",
  COURSE_EDITOR: "border-sky-400/35 bg-sky-500/15 text-sky-200",
  REVIEWER: "border-violet-400/35 bg-violet-500/15 text-violet-200",
  ANALYTICS_MANAGER: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
};

export default async function PermissionsPage() {
  await requireAdminPermission("users.manage");

  const t = await getTranslations("admin.permissions");

  let roles: Awaited<ReturnType<typeof prisma.permissionRole.findMany>> = [];
  let error: string | null = null;

  try {
    roles = await prisma.permissionRole.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });
  } catch {
    error = t("error");
  }

  const ROLE_LABELS: Record<PermissionRoleType, string> = {
    SUPER_ADMIN: t("roles.SUPER_ADMIN"),
    CONTENT_ADMIN: t("roles.CONTENT_ADMIN"),
    COURSE_EDITOR: t("roles.COURSE_EDITOR"),
    REVIEWER: t("roles.REVIEWER"),
    ANALYTICS_MANAGER: t("roles.ANALYTICS_MANAGER"),
  };

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 sm:p-7">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="section-title text-2xl">{t("title")}</h1>
        <p className="body-text text-sm">{t("description")}</p>
      </header>

      {error ? (
        <div className="surface-elevated rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : roles.length === 0 ? (
        <div className="surface-elevated p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-800 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">{t("columns.email")}</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">{t("columns.role")}</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400 hidden lg:table-cell">{t("columns.permissions")}</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">{t("columns.status")}</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400 hidden sm:table-cell">{t("columns.created")}</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => {
                  const permissions = Array.isArray(role.permissions) ? role.permissions as string[] : [];
                  return (
                    <tr
                      key={role.id}
                      className={
                        idx % 2 === 0
                          ? "border-b border-slate-800/50 bg-slate-950/30"
                          : "border-b border-slate-800/50 bg-slate-900/20"
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-200">{role.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[role.role]}`}
                        >
                          {ROLE_LABELS[role.role]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {permissions.slice(0, 4).map((perm) => (
                            <span
                              key={perm}
                              className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-xs text-slate-300"
                            >
                              {perm}
                            </span>
                          ))}
                          {permissions.length > 4 && (
                            <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-xs text-slate-500">
                              {t("morePermissions", { count: permissions.length - 4 })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-semibold ${role.isActive ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-slate-600/40 bg-slate-700/30 text-slate-400"}`}
                        >
                          {role.isActive ? t("active") : t("inactive")}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
                        {role.createdAt.toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {roles.map((role) => {
              const permissions = Array.isArray(role.permissions) ? role.permissions as string[] : [];
              return (
                <article key={role.id} className="surface-subtle rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[role.role]}`}
                    >
                      {ROLE_LABELS[role.role]}
                    </span>
                    <span
                      className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-semibold ${role.isActive ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-slate-600/40 bg-slate-700/30 text-slate-400"}`}
                    >
                      {role.isActive ? t("active") : t("inactive")}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-200">{role.email}</p>
                  {permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.slice(0, 6).map((perm) => (
                        <span
                          key={perm}
                          className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 font-mono text-xs text-slate-300"
                        >
                          {perm}
                        </span>
                      ))}
                      {permissions.length > 6 && (
                        <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-xs text-slate-500">
                          {t("morePermissions", { count: permissions.length - 6 })}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">{role.createdAt.toLocaleDateString("ru-RU")}</p>
                </article>
              );
            })}
          </div>
        </>
      )}

      <div className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">{t("reference.title")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(ROLE_LABELS) as PermissionRoleType[]).map((roleKey) => (
            <article key={roleKey} className="surface-subtle space-y-2 p-3">
              <span className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[roleKey]}`}>
                {ROLE_LABELS[roleKey]}
              </span>
              <ul className="space-y-0.5 text-xs text-slate-400">
                {roleKey === "SUPER_ADMIN" && (
                  <>
                    <li>All permissions granted</li>
                    <li>User management</li>
                    <li>Settings & security</li>
                  </>
                )}
                {roleKey === "CONTENT_ADMIN" && (
                  <>
                    <li>Create, edit, publish courses</li>
                    <li>Manage templates & media</li>
                    <li>View analytics</li>
                  </>
                )}
                {roleKey === "COURSE_EDITOR" && (
                  <>
                    <li>Create & edit courses (no publish)</li>
                    <li>Manage course builder</li>
                  </>
                )}
                {roleKey === "REVIEWER" && (
                  <>
                    <li>Review and approve content</li>
                    <li>Read-only course access</li>
                  </>
                )}
                {roleKey === "ANALYTICS_MANAGER" && (
                  <>
                    <li>View all analytics dashboards</li>
                    <li>Export reports</li>
                  </>
                )}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
