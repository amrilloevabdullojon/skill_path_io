import type { Metadata } from "next";
import { UserRole } from "@prisma/client";

import { updateUserAction } from "@/app/admin/actions";
import { SaveRowButton } from "@/components/admin/save-row-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Users — Admin",
  robots: { index: false },
};

const PAGE_SIZE = 25;

type UsersAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    role?: string | string[];
    page?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function UsersAdminPage({ searchParams }: UsersAdminPageProps) {
  await requireAdminPermission("users.manage");

  const query = paramValue(searchParams?.q);
  const roleParam = paramValue(searchParams?.role);
  const isValidRole = Object.values(UserRole).includes(roleParam as UserRole);
  const roleFilter = isValidRole ? roleParam : "ALL";

  const page = Math.max(1, parseInt(paramValue(searchParams?.page) || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(roleFilter !== "ALL" ? { role: roleFilter as UserRole } : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { progresses: true, certificates: true, peerReviewsGiven: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + PAGE_SIZE, total);

  return (
    <section className="page-shell">
      <PageHeader
        kicker="People"
        title="Users"
        description="Search, filter, and edit user roles. Changes apply immediately."
        aside={
          <a
            href="/api/admin/export/users"
            className="btn-secondary text-sm"
            download
          >
            Export CSV
          </a>
        }
      />

      {/* ── Filter ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or email…"
            className="input-base"
          />
          <select name="role" defaultValue={roleFilter} className="select-base">
            <option value="ALL">All roles</option>
            <option value={UserRole.ADMIN}>ADMIN</option>
            <option value={UserRole.STUDENT}>STUDENT</option>
            <option value={UserRole.PRO_STUDENT}>PRO_STUDENT</option>
            <option value={UserRole.MENTOR}>MENTOR</option>
            <option value={UserRole.RECRUITER}>RECRUITER</option>
          </select>
          <button type="submit" className="btn-secondary">
            Apply
          </button>
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {total} user{total !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : ""}
          {roleFilter !== "ALL" ? ` · role: ${roleFilter}` : ""}
        </p>

        {users.length === 0 ? (
          <EmptyState
            title="No users found"
            description={
              query || roleFilter !== "ALL"
                ? "Try changing the search query or role filter."
                : "No users exist yet."
            }
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[900px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left w-[240px]">User</th>
                  <th className="px-3 py-3 text-left">Level</th>
                  <th className="px-3 py-3 text-left">Role</th>
                  <th className="px-3 py-3 text-left border-l border-border/50">Progress</th>
                  <th className="px-3 py-3 text-left">Certs</th>
                  <th className="px-3 py-3 text-left">Reviews</th>
                  <th className="px-3 py-3 text-left border-l border-border/50">Joined</th>
                  <th className="px-3 py-3 text-left">Save</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const initial = (user.name || user.email).charAt(0).toUpperCase();
                  
                  // Gamified Status Badge Logic
                  // Highest priority badge takes precedence
                  let Badge = null;
                  if (user.role === UserRole.ADMIN) {
                    Badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-violet-500/10 text-violet-500 border border-violet-500/20">👑 Master</span>;
                  } else if (user.role === UserRole.MENTOR) {
                    Badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">⭐ Mentor</span>;
                  } else if (user.role === UserRole.PRO_STUDENT) {
                    Badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-sky-500/10 text-sky-500 border border-sky-500/20">💎 PRO</span>;
                  } else if (user._count.certificates > 0) {
                    Badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20">🏆 Alumni</span>;
                  } else if (user._count.peerReviewsGiven > 0) {
                    Badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20">🔥 Active</span>;
                  } else if (user._count.progresses > 0) {
                    Badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">🎓 Learner</span>;
                  } else {
                    Badge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-500/10 text-slate-500 border border-slate-500/20">🌱 Newbie</span>;
                  }

                  // Determine avatar color string based on character code to make it pseudo-random but consistent
                  const colorHash = initial.charCodeAt(0) % 5;
                  const avatarColors = [
                    "bg-indigo-500/10 text-indigo-500",
                    "bg-emerald-500/10 text-emerald-500",
                    "bg-rose-500/10 text-rose-500",
                    "bg-amber-500/10 text-amber-500",
                    "bg-sky-500/10 text-sky-500"
                  ];
                  const avatarColor = avatarColors[colorHash];

                  return (
                  <tr key={user.id} className="table-row group">
                    {/* User Profile (Avatar + Name + Email) */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 shrink-0 flex items-center justify-center rounded-full font-bold text-xs ${avatarColor}`}>
                          {initial}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <input
                            form={`user-edit-${user.id}`}
                            name="name"
                            defaultValue={user.name}
                            maxLength={120}
                            placeholder="Unnamed"
                            className="bg-transparent border border-transparent hover:border-border focus:border-ring rounded px-1 -ml-1 text-sm font-semibold text-foreground transition-colors w-full min-w-[120px]"
                          />
                          <span className="font-mono text-[10px] text-muted-foreground truncate px-1 -ml-1">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Gamified Level */}
                    <td className="px-3 py-2">
                      {Badge}
                    </td>

                    {/* Role (editable select) */}
                    <td className="px-3 py-2">
                      <div className="relative">
                        <select
                          form={`user-edit-${user.id}`}
                          name="role"
                          defaultValue={user.role}
                          className="bg-transparent appearance-none border border-transparent hover:border-border focus:border-ring rounded px-2 py-1 pr-6 text-xs transition-colors cursor-pointer w-[120px]"
                        >
                          {Object.values(UserRole).map((r) => (
                            <option key={r} value={r} className="bg-background">{r}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <svg className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </td>

                    {/* Progress count */}
                    <td className="px-3 py-2 text-sm text-foreground border-l border-border/50">
                      {user._count.progresses || <span className="text-muted-foreground/30">-</span>}
                    </td>

                    {/* Certificates count */}
                    <td className="px-3 py-2 text-sm text-foreground">
                      {user._count.certificates || <span className="text-muted-foreground/30">-</span>}
                    </td>

                    {/* Peer Reviews Given count */}
                    <td className="px-3 py-2 text-sm font-bold text-emerald-500">
                      {user._count.peerReviewsGiven || <span className="font-normal text-muted-foreground/30">-</span>}
                    </td>

                    {/* Joined date */}
                    <td className="px-3 py-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground border-l border-border/50">
                      {user.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Save */}
                    <td className="px-3 py-2">
                      <form id={`user-edit-${user.id}`} action={updateUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <SaveRowButton />
                      </form>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pagination ────────────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/users"
        params={{ q: query || undefined, role: roleFilter !== "ALL" ? roleFilter : undefined }}
        itemLabel="users"
        from={from}
        to={to}
        total={total}
      />
    </section>
  );
}
