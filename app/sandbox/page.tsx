import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Sandbox — SkillPath Academy",
  description: "Hands-on coding environments for practising SQL, scripting, and data analysis.",
};

const SANDBOXES = [
  {
    href: "/sandbox/sql",
    icon: Database,
    accent: "violet",
    title: "SQL Sandbox",
    description:
      "Write and run SQL queries in an in-browser environment. Practice SELECT, JOIN, GROUP BY, subqueries, and more with pre-loaded sample datasets.",
    badge: "DA",
    tags: ["SELECT", "JOIN", "GROUP BY", "Subqueries"],
  },
];

const ACCENT_CLASSES: Record<string, { icon: string; badge: string; tag: string }> = {
  violet: {
    icon: "border-violet-500/25 bg-violet-500/10 text-violet-400",
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    tag: "border-violet-500/20 bg-violet-500/8 text-violet-400",
  },
};

export default function SandboxIndexPage() {
  return (
    <section className="page-shell">
      <header className="space-y-2">
        <p className="kicker">Hands-on Practice</p>
        <h1 className="section-title">Sandbox</h1>
        <p className="body-text max-w-xl text-sm text-muted-foreground">
          Experiment in isolated environments — write code, run queries, and see results instantly.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SANDBOXES.map(({ href, icon: Icon, accent, title, description, badge, tags }) => {
          const cls = ACCENT_CLASSES[accent];
          return (
            <Link
              key={href}
              href={href}
              className="surface-panel surface-panel-hover flex flex-col gap-4 rounded-xl p-6 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${cls.icon}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls.badge}`}
                >
                  {badge}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${cls.tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="mt-auto text-sm font-medium text-sky-400">
                Open sandbox →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
