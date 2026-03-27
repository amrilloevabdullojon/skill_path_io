import type { Metadata } from "next";
import Link from "next/link";
import { Bug, BriefcaseBusiness } from "lucide-react";

export const metadata: Metadata = {
  title: "Simulations — SkillPath Academy",
  description: "Practice real-world QA and BA workflows in interactive simulations.",
};

const SIMULATIONS = [
  {
    href: "/simulation/bug-tracker",
    icon: Bug,
    accent: "emerald",
    title: "Bug Tracker Simulation",
    description:
      "Practice writing clear, reproducible bug reports in a realistic issue tracker. Covers severity levels, reproduction steps, and expected vs actual results.",
    badge: "QA",
  },
  {
    href: "/simulation/ba",
    icon: BriefcaseBusiness,
    accent: "sky",
    title: "BA Simulation",
    description:
      "Practice requirements gathering, stakeholder communication, and user-story writing in a realistic business analyst workflow.",
    badge: "BA",
  },
];

const ACCENT_CLASSES: Record<string, { icon: string; badge: string }> = {
  emerald: {
    icon: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  sky: {
    icon: "border-sky-500/25 bg-sky-500/10 text-sky-400",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
};

export default function SimulationIndexPage() {
  return (
    <section className="page-shell">
      <header className="space-y-2">
        <p className="kicker">Interactive Practice</p>
        <h1 className="section-title">Simulations</h1>
        <p className="body-text max-w-xl text-sm text-muted-foreground">
          Apply your skills in realistic workplace scenarios — no setup required.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SIMULATIONS.map(({ href, icon: Icon, accent, title, description, badge }) => {
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
              <span className="mt-auto text-sm font-medium text-sky-400">
                Start simulation →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
