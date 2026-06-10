import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { CareerReadinessDashboard } from "@/components/career/career-readiness-dashboard";
import { CareerRoadmapVisual } from "@/components/career/career-roadmap-visual";
import { SkillGapDetector } from "@/components/career/skill-gap-detector";
import { authOptions } from "@/lib/auth";
import { buildCareerSystem } from "@/lib/career/system";
import { getDashboardData } from "@/lib/dashboard/data";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";
import { getAdaptivePath } from "@/lib/recommendations/adaptive-path";

export const metadata: Metadata = {
  title: "Готовность к Карьере",
  description: "Отслеживайте свою готовность, находите пробелы в навыках и получите персональную дорожную карту к первому IT офферу.",
  openGraph: {
    title: "Дашборд Готовности к Карьере",
    description: "Измерьте свою готовность к ролям Junior QA, BA и Data Analyst.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const roleByTrack = {
  QA: "Junior QA",
  BA: "Junior BA",
  DA: "Junior Data Analyst",
} as const;

const requiredSkillsByRole: Record<(typeof roleByTrack)[keyof typeof roleByTrack], string[]> = {
  "Junior QA": ["Testing", "API", "Automation", "Communication"],
  "Junior BA": ["Business Analysis", "Communication", "Analytics", "SQL"],
  "Junior Data Analyst": ["SQL", "Analytics", "Communication", "Automation"],
};

export default async function CareerPage() {
  const [session, profile] = await Promise.all([
    getServerSession(authOptions),
    getOnboardingProfileFromCookie(),
  ]);

  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!dashboard) {
    return (
      <section className="surface-elevated border border-border/50 bg-card p-6 rounded-2xl">
        <p className="text-sm text-foreground/70">Данные дашборда пока не собраны. Пожалуйста, завершите онбординг.</p>
      </section>
    );
  }

  const targetRole = roleByTrack[profile.profession];
  const quizAccuracy =
    Number.parseInt(
      dashboard.stats.find((item) => item.id === "quiz-accuracy")?.value.replace("%", "") ?? "0",
      10,
    ) || 0;

  const careerSystem = buildCareerSystem({
    role: targetRole,
    track: profile.profession,
    radar: dashboard.skillRadar.data,
    quizAccuracy,
    missionCompletionRate: Math.round(
      (dashboard.weeklyQuests.filter((quest) => quest.status === "completed").length / Math.max(dashboard.weeklyQuests.length, 1)) * 100,
    ),
    simulationPerformance: Number.parseInt(
      dashboard.stats.find((item) => item.id === "simulations")?.value ?? "0",
      10,
    ) * 12,
    progressPercent: dashboard.hero.overallProgress,
    interests: profile.interests,
    goal: profile.goal,
    weeklyHours: profile.hoursPerWeek,
  });

  const coveredSkills = dashboard.skillRadar.data
    .filter((item) => item.value >= 65)
    .map((item) => item.skill);
  const adaptive = getAdaptivePath(careerSystem.adaptiveSignal);
  const recommendedActions = adaptive.suggestions.map((item) => item.action).slice(0, 4);
  const recommendedModules = dashboard.upcomingActions.slice(0, 3).map((item) => item.title);

  return (
    <section className="page-shell">
      <CareerReadinessDashboard
        role={targetRole}
        readiness={careerSystem.readiness}
        coveredSkills={coveredSkills}
        recommendedActions={recommendedActions}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SkillGapDetector
          targetRole={targetRole}
          userSkills={dashboard.skillRadar.data.map((item) => item.skill)}
          requiredSkills={requiredSkillsByRole[targetRole]}
          recommendedModules={recommendedModules}
        />
        <CareerRoadmapVisual readinessScore={careerSystem.readiness.score} />
      </div>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-6 border-t border-border/60 pt-6">
        <div className="w-full sm:w-auto flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">Портфолио</p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Ваши персональные проекты</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            Превратите выполненные миссии в артефакты для портфолио — главный аргумент при поиске работы.
          </p>
        </div>
        <Link href="/portfolio" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold whitespace-nowrap">
          Открыть портфолио
        </Link>
      </section>
    </section>
  );
}

