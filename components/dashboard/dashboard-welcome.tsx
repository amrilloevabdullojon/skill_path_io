import Link from "next/link";
import { BookOpen, Rocket, Target } from "lucide-react";

type DashboardWelcomeProps = {
  name?: string | null;
};

const STEPS = [
  {
    icon: Target,
    title: "Choose a track",
    description: "Pick QA, BA, or DA to start your learning path.",
    href: "/tracks",
    cta: "Browse tracks",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/25",
  },
  {
    icon: BookOpen,
    title: "Complete your first lesson",
    description: "Each lesson takes 10–20 minutes and builds real skills.",
    href: "/tracks",
    cta: "Start learning",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/25",
  },
  {
    icon: Rocket,
    title: "Set up your profile",
    description: "Showcase your progress and connect with the community.",
    href: "/profile/me",
    cta: "Edit profile",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/25",
  },
] as const;

export function DashboardWelcome({ name }: DashboardWelcomeProps) {
  return (
    <section className="surface-elevated premium-glow space-y-6 p-6 sm:p-8">
      <div className="space-y-1">
        <p className="kicker">Getting started</p>
        <h1 className="section-title">
          Welcome{name ? `, ${name}` : ""}! 👋
        </h1>
        <p className="body-text max-w-xl">
          SkillPath Academy helps you build job-ready skills in QA, Business Analysis, and Data
          Analytics. Here&apos;s how to get started:
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className={`surface-subtle rounded-2xl border p-4 space-y-3 ${step.bg}`}>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 text-xs font-bold text-slate-300">
                  {idx + 1}
                </span>
                <Icon className={`h-4 w-4 ${step.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">{step.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{step.description}</p>
              </div>
              <Link href={step.href} className="btn-secondary inline-flex h-8 px-3 text-xs">
                {step.cta}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
