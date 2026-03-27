import Link from "next/link";
import { Shield } from "lucide-react";

import { AdminNavBar } from "@/components/admin/admin-nav-bar";
import { requireAdminRoute } from "@/lib/admin-auth";
import { studioAdminLinks } from "@/lib/admin/studio-navigation";
import { hasAdminPermission } from "@/lib/permissions/admin-permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminRoute();
  const visibleLinks = studioAdminLinks.filter((link) =>
    hasAdminPermission(admin.adminRole, link.permission),
  );

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-4 p-5 text-foreground">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/10 text-rose-400">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <p className="kicker">Admin panel</p>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                SkillPath Academy Studio
              </h1>
              <p className="text-xs text-muted-foreground">
                {admin.email ?? "admin"} ·{" "}
                {admin.source === "session" ? "session" : "local demo"} ·{" "}
                {admin.adminRole}
              </p>
            </div>
          </div>
          <Link href="/dashboard" className="btn-secondary shrink-0">
            Back to dashboard
          </Link>
        </div>

        <AdminNavBar links={visibleLinks} />
      </header>

      {children}
    </section>
  );
}
