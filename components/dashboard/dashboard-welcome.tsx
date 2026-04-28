import Link from "next/link";
import { BookOpen, Rocket, Target } from "lucide-react";

type DashboardWelcomeProps = {
  name?: string | null;
};

const STEPS = [
  {
    icon: Target,
    title: "Выбери трек",
    description: "Выбери QA, BA или DA — и начни свой путь в обучении.",
    href: "/tracks",
    cta: "Смотреть треки",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/25",
  },
  {
    icon: BookOpen,
    title: "Пройди первый урок",
    description: "Каждый урок занимает 10–20 минут и формирует реальные навыки.",
    href: "/tracks",
    cta: "Начать обучение",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/25",
  },
  {
    icon: Rocket,
    title: "Настрой профиль",
    description: "Покажи прогресс и познакомься с сообществом.",
    href: "/profile/me",
    cta: "Изменить профиль",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/25",
  },
] as const;

export function DashboardWelcome({ name }: DashboardWelcomeProps) {
  return (
    <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] premium-glow space-y-6 p-6 sm:p-8">
      <div className="space-y-1">
        <p className="kicker">Начало работы</p>
        <h1 className="section-title">
          Добро пожаловать{name ? `, ${name}` : ""}! 👋
        </h1>
        <p className="body-text max-w-xl">
          Levio помогает прокачать востребованные навыки в QA, бизнес-анализе и аналитике данных. Вот с чего начать:
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className={`surface-subtle rounded-2xl border p-4 space-y-3 ${step.bg}`}>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card/80 text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                <Icon className={`h-4 w-4 ${step.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
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
