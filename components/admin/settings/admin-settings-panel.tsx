"use client";

import { useState } from "react";

import { getRolePermissions } from "@/lib/permissions/admin-permissions";
import { AdminRole } from "@/types/admin/permissions";

const roles: AdminRole[] = ["SUPER_ADMIN", "CONTENT_ADMIN", "COURSE_EDITOR", "REVIEWER", "ANALYTICS_MANAGER"];

export function AdminSettingsPanel() {
  const [mentorRateLimit, setMentorRateLimit] = useState("30");
  const [defaultLanguage, setDefaultLanguage] = useState("ru");
  const [autosave, setAutosave] = useState(true);

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5">
        <h1 className="text-2xl font-semibold text-foreground">Admin Settings</h1>
        <p className="text-sm text-muted-foreground">Local configuration panel for Academy Studio runtime behavior and role matrix.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-foreground">Studio preferences</h2>
          <div className="grid gap-3">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Default language</span>
              <select className="select-base" value={defaultLanguage} onChange={(event) => setDefaultLanguage(event.target.value)}>
                <option value="ru">Russian</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Admin AI rate limit (req/min)</span>
              <input className="input-base" value={mentorRateLimit} onChange={(event) => setMentorRateLimit(event.target.value)} />
            </label>
            <label className="surface-subtle flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <input type="checkbox" checked={autosave} onChange={(event) => setAutosave(event.target.checked)} className="h-4 w-4 accent-sky-400" />
              Enable autosave indicator in lesson builder
            </label>
          </div>
          <p className="text-xs text-muted-foreground">This page stores UI state locally for development and can be wired to Prisma later.</p>
        </section>

        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-foreground">Permission map</h2>
          <div className="space-y-2">
            {roles.map((role) => (
              <article key={role} className="surface-subtle space-y-2 p-3">
                <p className="text-sm font-semibold text-foreground">{role}</p>
                <div className="flex flex-wrap gap-1">
                  {getRolePermissions(role).map((permission) => (
                    <span key={permission} className="chip-neutral px-2 py-1 text-[10px]">
                      {permission}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
