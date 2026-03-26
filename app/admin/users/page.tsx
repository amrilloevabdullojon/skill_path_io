import { UserRole } from "@prisma/client";

import { updateUserAction } from "@/app/admin/actions";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type UsersAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    role?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function UsersAdminPage({ searchParams }: UsersAdminPageProps) {
  await requireAdminPermission("users.manage");

  const query = paramValue(searchParams?.q);
  const roleParam = paramValue(searchParams?.role);
  const roleFilter = roleParam === UserRole.ADMIN || roleParam === UserRole.STUDENT ? roleParam : "ALL";

  const users = await prisma.user.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(roleFilter !== "ALL" ? { role: roleFilter } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          progresses: true,
          certificates: true,
        },
      },
    },
  });

  return (
    <section className="surface-elevated space-y-4 p-5 text-foreground">
      <header className="space-y-2">
        <h2 className="section-title">Users</h2>
        <p className="text-sm text-muted-foreground">Search, filter, and edit user roles locally.</p>
      </header>

      <form className="surface-subtle grid gap-3 p-4 md:grid-cols-[1fr_180px_auto]">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name or email"
          className="input-base"
        />
        <select
          name="role"
          defaultValue={roleFilter}
          className="select-base"
        >
          <option value="ALL">All roles</option>
          <option value={UserRole.ADMIN}>ADMIN</option>
          <option value={UserRole.STUDENT}>STUDENT</option>
        </select>
        <button
          type="submit"
          className="btn-secondary"
        >
          Apply
        </button>
      </form>

      <div className="table-shell">
        <table className="table-base min-w-[900px]">
          <thead className="table-head">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Progress</th>
              <th className="px-3 py-3">Certificates</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="table-row">
                <td className="px-3 py-3">
                  <input
                    form={`user-edit-${user.id}`}
                    name="name"
                    defaultValue={user.name}
                    className="input-base h-9 px-2 py-1.5"
                  />
                </td>
                <td className="px-3 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-3 py-3">
                  <select
                    form={`user-edit-${user.id}`}
                    name="role"
                    defaultValue={user.role}
                    className="select-base h-9 px-2 py-1.5"
                  >
                    <option value={UserRole.ADMIN}>ADMIN</option>
                    <option value={UserRole.STUDENT}>STUDENT</option>
                  </select>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{user._count.progresses}</td>
                <td className="px-3 py-3 text-muted-foreground">{user._count.certificates}</td>
                <td className="px-3 py-3 text-muted-foreground">{user.createdAt.toLocaleDateString()}</td>
                <td className="px-3 py-3">
                  <form id={`user-edit-${user.id}`} action={updateUserAction} className="inline-flex">
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={7}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
