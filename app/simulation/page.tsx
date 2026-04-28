import type { Metadata } from "next";
import Link from "next/link";
import { Bug, BriefcaseBusiness } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Симуляции — Levio",
  description: "Практикуйтесь в реальных рабочих процессах QA и BA в интерактивных симуляциях.",
};

const SIMULATIONS = [
  {
    href: "/simulation/bug-tracker",
    icon: Bug,
    accent: "emerald",
    title: "Симулятор Баг-трекера (Jira)",
    description:
      "Практикуйтесь в написании понятных и воспроизводимых баг-репортов. Отработка уровней серьезности, шагов воспроизведения и ожидаемых результатов.",
    badge: "QA",
  },
  {
    href: "/simulation/ba",
    icon: BriefcaseBusiness,
    accent: "sky",
    title: "Симулятор Бизнес-Аналитика",
    description:
      "Тренируйте сбор требований, общение со стейкхолдерами и написание пользовательских историй (User Stories) в реалистичном BA процессе.",
    badge: "BA",
  },
];

const ACCENT_CLASSES: Record<string, { icon: string; badge: string; cardHover: string }> = {
  emerald: {
    icon: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    cardHover: "hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:bg-card/60",
  },
  sky: {
    icon: "border-sky-500/30 bg-sky-500/15 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    cardHover: "hover:border-sky-500/40 hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] hover:bg-card/60",
  },
};

export default function SimulationIndexPage() {
  return (
    <section className="page-shell relative isolate">
      {/* Background glow flares */}
      <div className="absolute top-0 right-0 -z-10 h-[400px] w-[400px] -translate-y-20 translate-x-20 rounded-full bg-emerald-500 blur-[130px] opacity-[0.15] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] translate-y-20 -translate-x-20 rounded-full bg-sky-500 blur-[130px] opacity-[0.12] pointer-events-none" />

      <header className="space-y-3">
        <p className="kicker">Интерактивная практика</p>
        <h1 className="section-title text-4xl">Симуляции</h1>
        <p className="body-text max-w-xl text-sm text-muted-foreground/80">
          Применяйте свои навыки в реалистичных рабочих сценариях — полная готовность к выполнению задач без предварительных настроек.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 mt-8">
        {SIMULATIONS.map(({ href, icon: Icon, accent, title, description, badge }) => {
          const cls = ACCENT_CLASSES[accent];
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-6 flex flex-col gap-5",
                "transition-all duration-300 hover:-translate-y-1",
                cls.cardHover
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-colors",
                    cls.icon
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    cls.badge
                  )}
                >
                  {badge}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors">{title}</h2>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{description}</p>
              </div>
              <span className="mt-auto text-sm font-semibold text-sky-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Запустить симуляцию <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
