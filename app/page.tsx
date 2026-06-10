import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LandingAmbientBackground } from "@/components/landing/landing-ambient-background";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHeroPreview } from "@/components/landing/landing-hero-preview";
import { LandingSkillRadarDemo } from "@/components/landing/landing-skill-radar-demo";
import { SectionReveal } from "@/components/landing/section-reveal";
import { TracksSection, MissionsSection } from "@/components/landing/catalog-section";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Levio — QA, BA & DA Career Tracks",
  description: "Structured learning paths for QA Engineers, Business Analysts, and Data Analysts. Learn with missions, quizzes, and AI-powered feedback.",
  openGraph: {
    title: "Levio",
    description: "Role-focused career tracks for QA, BA, and DA professionals.",
    type: "website",
  },
};

// ─── How it works (merged with value props) ────────────────────────────────
const steps = [
  {
    title: "Выберите трек",
    description: "QA, BA, DA или PM — с понятной дорожной картой и оценкой ваших стартовых навыков.",
  },
  {
    title: "Проходите модули",
    description: "Интерактивные уроки, квизы и челленджи с детальной обратной связью от ИИ-ментора.",
  },
  {
    title: "Решайте миссии",
    description: "Реальные сценарии из продуктовых команд: баг-репорты, SQL-запросы, требования.",
  },
  {
    title: "Готовьтесь к офферу",
    description: "Мок-интервью с ИИ, аналитика навыков и портфолио — всё для уверенного выхода на рынок.",
  },
];

const outcomes = [
  "Писать качественные баг-репорты и критерии приёмки",
  "Строить SQL-запросы к БД и описывать продуктовые метрики",
  "Справляться с рабочими кейсами ещё до первого собеса",
  "Уверенно проходить скрининги благодаря ИИ-ментору",
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Бесплатно",
    description: "Идеально для старта и знакомства с платформой.",
    features: ["1 карьерный трек", "Базовые модули", "Начальные квизы", "Трекинг прогресса"],
    cta: "Начать обучение",
    href: "/login",
    highlight: false,
  },
  {
    name: "Pro Learner",
    price: "₽2 490",
    period: "/ мес",
    description: "Полный доступ к миссиям, ИИ-ментору и симуляторам.",
    features: [
      "Все карьерные треки",
      "Реальные ИИ-миссии",
      "Поддержка ИИ-ментора",
      "Мок-интервью",
      "Конструктор портфолио",
      "Приоритетная поддержка",
    ],
    cta: "Перейти на Pro",
    href: "/login",
    highlight: true,
  },
  {
    name: "Team Academy",
    price: "По запросу",
    description: "Инструменты для обучения команд и когорт.",
    features: [
      "Без лимита сотрудников",
      "Админ-панель",
      "B2B-дашборд",
      "Свои карьерные пути",
      "Групповая динамика",
      "Персональный менеджер",
    ],
    cta: "Связаться с нами",
    href: "mailto:hello@levio.app",
    highlight: false,
  },
];

// ─── Skeletons (use shared Skeleton primitives with shimmer for consistency) ──
function TracksSkeleton() {
  return (
    <section id="tracks" className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-7 w-64 rounded" />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-border/50 p-5"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-5 w-36 rounded" />
            </div>
            <Skeleton className="h-10 rounded" />
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((j) => (
                <Skeleton key={j} className="h-14 rounded" />
              ))}
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-14 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>
            <Skeleton className="h-9 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

function MissionsSkeleton() {
  return (
    <section id="missions" className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-7 w-80 rounded" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-border/50 p-5"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-8 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-8 rounded" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <Skeleton className="h-9 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <LandingAmbientBackground />

      <div className="mx-auto w-full max-w-[112rem] px-3 pb-14 sm:px-5 lg:px-7">
        <LandingHeader />

        <main className="space-y-20 pb-16 pt-8 sm:space-y-24 sm:pt-12">

          {/* ── Hero ─────────────────────────────────────── */}
          <SectionReveal>
            <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <div className="space-y-7">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
                  Строим реальные навыки
                </p>
                <h1 className="max-w-3xl page-title tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12]">
                  Запусти свою IT-карьеру через{" "}
                  <span className="gradient-headline">
                    ИИ-миссии, модули,
                  </span>{" "}
                  и живую практику
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Levio объединяет практику, карьерный трекинг и обратную связь от ИИ-ментора в одной платформе для будущих QA, BA и DA.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/skill-test" className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-[0_4px_24px_rgba(99,102,241,0.30)]")}>
                    Пройти ИИ-аудит навыков
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#tracks" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                    Смотреть треки
                  </a>
                </div>
              </div>
              <LandingHeroPreview />
            </section>
          </SectionReveal>

          {/* ── How it works (merged value props + steps) ─── */}
          <SectionReveal>
            <section className="space-y-8">
              <div className="section-header">
                <p className="kicker">Как это работает</p>
                <h2 className="section-title">Четыре шага к первому офферу</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {steps.map((item, index) => (
                  <SectionReveal key={item.title} delay={index * 0.06}>
                    <article className="relative flex h-full flex-col gap-4 border-t border-border/60 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                      </div>
                    </article>
                  </SectionReveal>
                ))}
              </div>
            </section>
          </SectionReveal>

          {/* ── Tracks ───────────────────────────────────── */}
          <Suspense fallback={<TracksSkeleton />}>
            <TracksSection />
          </Suspense>

          {/* ── Platform preview (merged: dashboard + radar) ── */}
          <SectionReveal>
            <section className="space-y-8">
              <div className="section-header">
                <p className="kicker">Внутри платформы</p>
                <h2 className="section-title">Командный центр обучения</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Прогресс по модулям, радар компетенций и рекомендации ИИ — в одном дашборде.
                </p>
              </div>

              <div className="surface-elevated space-y-6 p-5 sm:p-7">
                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="content-card rounded-2xl p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="stat-card">
                        <p className="stat-card-label">Опыт (XP)</p>
                        <p className="stat-card-value mt-1 text-xl">1 840</p>
                      </div>
                      <div className="stat-card">
                        <p className="stat-card-label">Активный трек</p>
                        <p className="stat-card-value mt-1 text-base">QA Engineer</p>
                      </div>
                      <div className="stat-card">
                        <p className="stat-card-label">Точность квизов</p>
                        <p className="stat-card-value mt-1 text-xl">82%</p>
                      </div>
                    </div>
                    <div className="mini-stat-box mt-3 p-4">
                      <p className="text-sm font-semibold text-foreground">Виджеты дашборда</p>
                      <p className="mt-1 text-xs text-muted-foreground">Карты навыков, радары компетенций, рекомендации ИИ и еженедельные квесты.</p>
                    </div>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {[
                      { label: "Трекинг прогресса", desc: "Динамика, следующий модуль и прогноз времени до завершения." },
                      { label: "Карточки миссий", desc: "Практические сценарии, награды XP и понятные действия." },
                      { label: "Аналитика роста", desc: "Уровни, серия активности и готовность к рынку." },
                    ].map((item) => (
                      <li key={item.label} className="py-4 first:pt-0 last:pb-0">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <LandingSkillRadarDemo />
            </section>
          </SectionReveal>

          {/* ── AI mentor ────────────────────────────────── */}
          <SectionReveal>
            <section className="surface-elevated grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
              <div className="flex flex-col justify-center space-y-4">
                <div className="section-header">
                  <p className="kicker">ИИ-ментор всегда рядом</p>
                  <h2 className="section-title">Персональная стратегия с первого дня</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Расскажите Levio о целевой профессии и темпе. ИИ-ментор соберёт пошаговый план и адаптирует его под ваш стиль обучения.
                </p>
                <Link href="/interview-preview" className={cn(buttonVariants({ variant: "accent", size: "sm" }), "w-fit gap-2")}>
                  <Bot className="h-3.5 w-3.5" />
                  Живой тест интервью
                </Link>
                <p className="text-xs text-muted-foreground">
                  Хотите карьерную дорожную карту?{" "}
                  <Link href="/career" className="text-foreground underline-offset-4 hover:underline">
                    Открыть карьерный план →
                  </Link>
                </p>
              </div>
              <div className="content-card space-y-2.5 rounded-2xl p-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border bg-card px-3.5 py-2.5 text-sm text-foreground">
                    Я хочу стать QA-инженером.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-violet-400/20 bg-violet-500/10 px-3.5 py-2.5 text-sm text-violet-100">
                    Отличная цель! Сколько часов в неделю сможете уделять обучению?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border bg-card px-3.5 py-2.5 text-sm text-foreground">
                    Около 7 часов.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-2.5 text-sm leading-relaxed text-indigo-100">
                    Ваш план: QA Foundations → API Testing → Практика с баг-трекером → Мок-интервью.
                  </div>
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* ── Missions ─────────────────────────────────── */}
          <Suspense fallback={<MissionsSkeleton />}>
            <MissionsSection />
          </Suspense>

          {/* ── Outcomes ─────────────────────────────────── */}
          <SectionReveal>
            <section id="about" className="surface-elevated scroll-mt-28 p-5 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="section-header">
                  <p className="kicker">Результаты</p>
                  <h2 className="section-title">Чему вы реально научитесь</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Программа построена вокруг навыков, которые проверяют на собеседованиях.
                  </p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="content-card flex items-start gap-3 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                      <span className="text-sm text-foreground">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </SectionReveal>

          {/* ── Pricing ──────────────────────────────────── */}
          <SectionReveal>
            <section id="pricing" className="scroll-mt-28 space-y-8">
              <div className="section-header">
                <p className="kicker">Тарифы</p>
                <h2 className="section-title">Простые планы для любой цели</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {pricingPlans.map((plan, i) => (
                  <SectionReveal key={plan.name} delay={i * 0.1}>
                  <article
                    className={cn(
                      "relative flex flex-col gap-5 rounded-2xl border p-6",
                      plan.highlight
                        ? "border-indigo-400/35 bg-gradient-to-b from-indigo-500/10 to-slate-900/70 shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_16px_40px_rgba(2,6,23,0.42)]"
                        : "surface-subtle",
                    )}
                  >
                    {plan.highlight ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-300">
                          <Sparkles className="h-3 w-3" aria-hidden />
                          Самый популярный
                        </span>
                      </div>
                    ) : null}
                    <div>
                      <p className={cn("text-sm font-semibold", plan.highlight ? "text-primary-foreground" : "text-foreground")}>{plan.name}</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className={cn("metric-value", plan.highlight && "text-primary-foreground")}>{plan.price}</span>
                        {plan.period ? (
                          <span className={cn("text-sm", plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>{plan.period}</span>
                        ) : null}
                      </div>
                      <p className={cn("mt-1.5 text-xs", plan.highlight ? "text-slate-300" : "text-muted-foreground")}>{plan.description}</p>
                    </div>
                    <ul className="flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className={cn("flex items-center gap-2 text-sm", plan.highlight ? "text-slate-200" : "text-muted-foreground")}>
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={plan.href}
                      className={cn(
                        plan.highlight
                          ? buttonVariants({ size: "sm" })
                          : buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full",
                      )}
                    >
                      {plan.cta}
                    </a>
                  </article>
                  </SectionReveal>
                ))}
              </div>
            </section>
          </SectionReveal>

          {/* ── Final CTA (B2B angle, differentiated from Hero) ─── */}
          <SectionReveal>
            <section className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/70 p-8 text-center shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_24px_60px_rgba(2,6,23,0.5)] sm:p-12">
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/12 blur-3xl" />
              </div>
              <div className="relative space-y-4">
                <h2 className="mx-auto max-w-2xl page-title tracking-tight text-primary-foreground sm:text-4xl">
                  Обучаете команду?{" "}
                  <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
                    Levio для бизнеса
                  </span>
                </h2>
                <p className="mx-auto max-w-lg text-base leading-relaxed text-slate-300">
                  Свои карьерные пути, B2B-дашборд и аналитика прогресса для когорт от 10 человек.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a href="mailto:hello@levio.app?subject=Levio for Teams" className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-[0_10px_30px_rgba(99,102,241,0.35)]")}>
                    <Users className="h-4 w-4" aria-hidden />
                    Записаться на демо
                  </a>
                  <Link href="#pricing" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                    Сравнить тарифы
                  </Link>
                </div>
              </div>
            </section>
          </SectionReveal>
        </main>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t border-border/70 py-10">
          <div className="grid gap-8 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-500/15 text-indigo-200">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                </span>
                <p className="font-semibold text-foreground">Levio</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">EdTech-платформа для карьеры в QA, BA и DA — от первого модуля до оффера.</p>
            </div>
            <div className="space-y-2">
              <p className="module-order-label font-semibold">Продукт</p>
              <Link href="/tracks" className="block transition-colors hover:text-foreground">Треки</Link>
              <Link href="/missions" className="block transition-colors hover:text-foreground">Миссии</Link>
              <Link href="/career" className="block transition-colors hover:text-foreground">Карьера</Link>
            </div>
            <div className="space-y-2">
              <p className="module-order-label font-semibold">ИИ и обучение</p>
              <Link href="/dashboard" className="block transition-colors hover:text-foreground">Дашборд</Link>
              <Link href="/interview" className="block transition-colors hover:text-foreground">ИИ-интервью</Link>
              <Link href="/planner" className="block transition-colors hover:text-foreground">Планировщик</Link>
            </div>
            <div className="space-y-2">
              <p className="module-order-label font-semibold">Компания</p>
              <a href="#about" className="block transition-colors hover:text-foreground">О нас</a>
              <a href="#pricing" className="block transition-colors hover:text-foreground">Цены</a>
              <a href="mailto:hello@levio.app" className="block transition-colors hover:text-foreground">Контакты</a>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Levio. Локальная версия.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
