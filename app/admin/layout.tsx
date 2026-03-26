import Link from "next/link";

import { requireAdminRoute } from "@/lib/admin-auth";
import { studioAdminLinks } from "@/lib/admin/studio-navigation";
import { hasAdminPermission } from "@/lib/permissions/admin-permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminRoute();
  const visibleLinks = studioAdminLinks.filter((link) => hasAdminPermission(admin.adminRole, link.permission));

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-4 p-5 text-foreground">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="kicker">Admin panel</p>
            <h1 className="text-2xl font-semibold tracking-tight">SkillPath Academy</h1>
            <p className="text-sm text-muted-foreground">
              Signed as {admin.email ?? "admin"} ({admin.source === "session" ? "session" : "local demo"})
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Role: {admin.adminRole}</p>
          </div>
          <Link
            href="/dashboard"
            className="btn-secondary"
          >
            Back to dashboard
          </Link>
        </div>

        <nav className="flex flex-wrap gap-2">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-secondary px-3 py-2 text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}
    </section>
  );
}
