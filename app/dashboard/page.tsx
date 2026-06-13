import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FolderKanban,
  LineChart,
  Rocket,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { getServerSession } from "next-auth";

import { DashboardAiRecommendationsSection } from "@/components/dashboard/dashboard-ai-recommendations";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardSkillRadarSection } from "@/components/dashboard/dashboard-skill-radar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DashboardXpLevelSection } from "@/components/dashboard/dashboard-xp-level";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getDashboardData, type DashboardData } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type DashboardTab = "overview" | "skills";

function resolveTab(value?: string): DashboardTab {
  return value === "skills" ? "skills" : "overview";
}

function progressWidth(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function TodayInsightPanel({ data }: { data: DashboardData }) {
  const lastWeek = data.weeklyProgress.at(-1);
  const previousWeek = data.weeklyProgress.at(-2);
  const weeklyVelocity = Math.max(0, (lastWeek?.progress ?? 0) - (previousWeek?.progress ?? 0));

  return (
    <div className="sticky top-24 max-h-[calc(100dvh-7rem)] min-w-0 space-y-4 overflow-y-auto pr-1 overscroll-contain">
      <section className="surface-elevated space-y-4 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/50 text-indigo-300">
            <LineChart className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Прогресс недели</p>
            <p className="text-xs text-muted-foreground">Короткий контроль темпа</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="mini-stat-box p-3">
            <p className="text-[11px] text-muted-foreground">XP</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{data.xp.weeklyXp}</p>
          </div>
          <div className="mini-stat-box p-3">
            <p className="text-[11px] text-muted-foreground">Серия</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{data.xp.streak} дн.</p>
          </div>
        </div>

        <div className="content-card p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Общий путь</span>
            <span className="font-semibold text-foreground">{data.hero.overallProgress}%</span>
          </div>
          <div className="progress-track mt-2 h-2">
            <div className="h-full rounded-full bg-indigo-400" style={{ width: progressWidth(data.hero.overallProgress) }} />
          </div>
        </div>

        <div className="content-card p-3 text-xs">
          <p className="text-muted-foreground">
            Темп: <span className="text-foreground">+{weeklyVelocity}% за неделю</span>
          </p>
          <p className="text-muted-foreground">
            Фокус: <span className="text-foreground">{data.skillRadar.nextFocus}</span>
          </p>
        </div>
      </section>

      <section className="surface-elevated space-y-3 p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Trophy className="h-4 w-4 text-amber-300" />
          Ближайшие результаты
        </p>
        {data.achievements.slice(0, 3).map((item) => (
          <article key={item.id} className="content-card p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-base font-semibold text-foreground">{item.value}</p>
            <p className="text-[11px] text-muted-foreground">{item.hint}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function TodayDashboard({ data }: { data: DashboardData }) {
  const primaryAction = data.upcomingActions[0];
  const primaryTrack = data.tracks[0];
  const practiceMission = data.missionPreview[0];
  const aiRecommendation = data.recommendations[0];

  return (
    <div className="space-y-6">
      <section className="surface-elevated overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip-neutral inline-flex items-center gap-1.5 px-2.5 py-1 text-xs">
                <CalendarCheck className="h-3.5 w-3.5 text-indigo-300" />
                Сегодня
              </span>
              <span className="chip-neutral px-2.5 py-1 text-xs">{data.hero.primaryTrackTitle}</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {primaryAction ? primaryAction.title : "Выберите следующий учебный шаг"}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {primaryAction
                  ? primaryAction.description
                  : "Откройте трек и начните первый урок. После этого здесь появится конкретная задача на день."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={primaryAction?.href ?? data.hero.continueHref}
                className={cn(buttonVariants({ variant: "contrast", size: "lg" }), "gap-2")}
              >
                Продолжить обучение
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/missions" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "gap-2")}>
                Открыть практику
                <Rocket className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="border-t border-border-subtle bg-background/30 p-5 lg:border-l lg:border-t-0 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="content-card p-4">
                <p className="text-xs text-muted-foreground">Время</p>
                <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                  <Clock3 className="h-4 w-4 text-indigo-300" />
                  {primaryAction?.eta ?? data.hero.trackCompletionEstimate}
                </p>
              </div>
              <div className="content-card p-4">
                <p className="text-xs text-muted-foreground">Награда</p>
                <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                  <Zap className="h-4 w-4 text-amber-300" />
                  +{primaryAction?.xpReward ?? 0} XP
                </p>
              </div>
              <div className="content-card p-4">
                <p className="text-xs text-muted-foreground">Навык</p>
                <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                  <Target className="h-4 w-4 text-emerald-300" />
                  {primaryAction?.skillImpact ?? data.skillRadar.nextFocus}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="surface-elevated space-y-5 p-5 sm:p-6">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-heading">Текущий трек</h2>
              <p className="section-subtext mt-1">Следующий урок и понятный прогресс без лишней аналитики.</p>
            </div>
            <Link href="/tracks" className="btn-secondary px-3 py-1.5 text-xs">Все треки</Link>
          </header>

          {primaryTrack ? (
            <article className="content-card space-y-5 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-foreground">{primaryTrack.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{primaryTrack.description}</p>
                </div>
                <span className="chip-neutral px-2.5 py-1 text-xs">{primaryTrack.category}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {primaryTrack.completedModules} из {primaryTrack.totalModules} модулей
                  </span>
                  <span className="font-semibold text-foreground">{primaryTrack.progressPercent}%</span>
                </div>
                <div className="progress-track h-2">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: progressWidth(primaryTrack.progressPercent) }} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="mini-stat-box p-3">
                  <p className="text-[11px] text-muted-foreground">Следующий урок</p>
                  <p className="mt-1 truncate text-sm font-semibold text-foreground">
                    {primaryTrack.nextModuleTitle ?? "Трек завершён"}
                  </p>
                </div>
                <div className="mini-stat-box p-3">
                  <p className="text-[11px] text-muted-foreground">Оценка завершения</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{primaryTrack.estimatedCompletion}</p>
                </div>
              </div>

              <Link href={primaryTrack.nextModuleHref} className="btn-primary inline-flex w-full justify-center gap-2 px-4 py-3">
                Перейти к уроку
                <BookOpenCheck className="h-4 w-4" />
              </Link>
            </article>
          ) : (
            <p className="text-sm text-muted-foreground">Активный трек пока не выбран.</p>
          )}
        </section>

        <section className="surface-elevated space-y-5 p-5 sm:p-6">
          <header>
            <h2 className="section-heading">Практика дня</h2>
            <p className="section-subtext mt-1">Одна рабочая задача, которая может лечь в портфолио.</p>
          </header>

          {practiceMission ? (
            <article className="content-card space-y-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{practiceMission.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{practiceMission.scenario}</p>
                </div>
                <span className="chip-neutral shrink-0 px-2.5 py-1 text-xs">+{practiceMission.xpReward} XP</span>
              </div>
              <Link href="/missions" className="btn-secondary inline-flex w-full justify-center gap-2 px-4 py-2.5">
                Начать миссию
                <BriefcaseBusiness className="h-4 w-4" />
              </Link>
            </article>
          ) : (
            <p className="text-sm text-muted-foreground">Практические миссии появятся после старта трека.</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-elevated space-y-4 p-5 sm:p-6">
          <header className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 text-cyan-300">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <h2 className="section-heading">AI-подсказка</h2>
              <p className="section-subtext mt-1">Короткая коррекция, а не ещё один большой виджет.</p>
            </div>
          </header>
          {aiRecommendation ? (
            <article className="content-card space-y-3 p-4">
              <p className="text-sm font-semibold text-foreground">{aiRecommendation.title}</p>
              <p className="text-sm text-muted-foreground">{aiRecommendation.description}</p>
              <Link href={aiRecommendation.href} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                Открыть рекомендацию
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ) : (
            <p className="text-sm text-muted-foreground">AI-подсказка появится после первых действий.</p>
          )}
        </section>

        <section className="surface-elevated space-y-4 p-5 sm:p-6">
          <header className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 text-emerald-300">
              <FolderKanban className="h-5 w-5" />
            </span>
            <div>
              <h2 className="section-heading">Портфолио</h2>
              <p className="section-subtext mt-1">Что уже можно показать как результат обучения.</p>
            </div>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="content-card p-4">
              <p className="text-xs text-muted-foreground">Артефактов</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{data.portfolioPreview.totalEntries}</p>
            </div>
            <div className="content-card p-4">
              <p className="text-xs text-muted-foreground">Из миссий</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{data.portfolioPreview.missionArtifacts}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Последнее: {data.portfolioPreview.recentEntryTitle ?? "пока нет сохранённых работ"}
          </p>
          <Link href="/portfolio" className="btn-secondary inline-flex w-full justify-center gap-2 px-4 py-2.5">
            Открыть портфолио
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <section className="surface-elevated space-y-4 p-5 sm:p-6">
        <header>
          <h2 className="section-heading">План на сегодня</h2>
          <p className="section-subtext mt-1">Три ближайших шага, без бесконечной ленты задач.</p>
        </header>
        <div className="grid gap-3">
          {data.upcomingActions.slice(0, 3).map((action, index) => (
            <Link
              key={action.id}
              href={action.href}
              className="content-card flex items-start gap-4 p-4 transition-colors hover:border-indigo-400/40"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background/50 text-xs font-semibold text-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{action.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{action.description}</span>
              </span>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProgressDashboard({ data }: { data: DashboardData }) {
  const nextAction = data.upcomingActions[0];

  return (
    <div className="space-y-6">
      <section className="surface-elevated p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.42fr)] lg:items-center">
          <div className="space-y-2">
            <p className="kicker">Фокус развития</p>
            <h2 className="section-heading">Сначала подтяните: {data.skillRadar.nextFocus}</h2>
            <p className="section-subtext max-w-2xl">
              Этот экран показывает прогресс, но следующий учебный шаг всё равно один: закройте ближайшее действие и возвращайтесь к радару после практики.
            </p>
          </div>
          <div className="content-card space-y-3 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Следующее действие</p>
            <p className="text-sm font-semibold text-foreground">{nextAction?.title ?? "Продолжить текущий модуль"}</p>
            <Link href={nextAction?.href ?? data.hero.continueHref} className="btn-primary inline-flex w-full justify-center gap-2 px-4 py-2.5">
              Перейти к шагу
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <DashboardSkillRadarSection radar={data.skillRadar} />
        <DashboardXpLevelSection xp={data.xp} weeklyProgress={data.weeklyProgress} />
      </div>
      <DashboardAiRecommendationsSection recommendations={data.recommendations} />
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;
  const currentTab = resolveTab(resolvedSearchParams?.tab);
  const data = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!data) {
    return (
      <EmptyState
        title="Данные дашборда пусты"
        description="Данные пользователя не найдены. Войди и заверши онбординг или импортируй начальный контент."
        actionLabel="Перейти к трекам"
        actionHref="/tracks"
      />
    );
  }

  const primaryAction = data.upcomingActions[0];
  const nextActionHref = primaryAction?.href ?? data.hero.continueHref;
  const nextActionTitle =
    currentTab === "skills"
      ? `Прокачать: ${data.skillRadar.nextFocus}`
      : primaryAction?.title ?? "Продолжить обучение";
  const nextActionMeta =
    currentTab === "skills"
      ? `${data.hero.overallProgress}% общего пути, ${data.xp.weeklyXp} XP за неделю`
      : primaryAction
        ? `${primaryAction.eta} · +${primaryAction.xpReward} XP · ${primaryAction.skillImpact}`
        : data.hero.trackCompletionEstimate;

  return (
    <section className="page-shell text-foreground">
      <DashboardLayout
        topbar={
          <DashboardTopbar
            name={data.user.name}
            role={data.user.role}
            currentTab={currentTab}
            nextActionTitle={nextActionTitle}
            nextActionHref={nextActionHref}
            nextActionMeta={nextActionMeta}
          />
        }
        insights={<TodayInsightPanel data={data} />}
      >
        {currentTab === "skills" ? <ProgressDashboard data={data} /> : <TodayDashboard data={data} />}
      </DashboardLayout>
    </section>
  );
}

export const metadata: import("next").Metadata = {
  title: "Сегодня",
  description: "Ежедневный учебный рабочий стол Levio.",
  robots: { index: false },
};
