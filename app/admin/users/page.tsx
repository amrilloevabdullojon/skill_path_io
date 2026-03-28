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
  const roleFilter =
    roleParam === UserRole.ADMIN || roleParam === UserRole.STUDENT ? roleParam : "ALL";

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
        _count: { select: { progresses: true, certificates: true } },
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
                  <th className="px-3 py-3 text-left">Name</th>
                  <th className="px-3 py-3 text-left">Email</th>
                  <th className="px-3 py-3 text-left">Role</th>
                  <th className="px-3 py-3 text-left">Progress</th>
                  <th className="px-3 py-3 text-left">Certs</th>
                  <th className="px-3 py-3 text-left">Joined</th>
                  <th className="px-3 py-3 text-left">Save</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="table-row">
                    {/* Name (editable) */}
                    <td className="px-3 py-2">
                      <input
                        form={`user-edit-${user.id}`}
                        name="name"
                        defaultValue={user.name}
                        maxLength={120}
                        className="input-base h-9 min-w-[140px] px-2 py-1.5 text-sm"
                      />
                    </td>

                    {/* Email (read-only) */}
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {user.email}
                    </td>

                    {/* Role (editable select) */}
                    <td className="px-3 py-2">
                      <select
                        form={`user-edit-${user.id}`}
                        name="role"
                        defaultValue={user.role}
                        className="select-base h-9 px-2 py-1 text-xs"
                      >
                        <option value={UserRole.ADMIN}>ADMIN</option>
                        <option value={UserRole.STUDENT}>STUDENT</option>
                      </select>
                    </td>

                    {/* Progress count */}
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {user._count.progresses}
                    </td>

                    {/* Certificates count */}
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {user._count.certificates}
                    </td>

                    {/* Joined date */}
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {user.createdAt.toLocaleDateString()}
                    </td>

                    {/* Save */}
                    <td className="px-3 py-2">
                      <form id={`user-edit-${user.id}`} action={updateUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <SaveRowButton />
                      </form>
                    </td>
                  </tr>
                ))}
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
