import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Settings2 } from "lucide-react";

import { PersonalLearningPlanner } from "@/components/planner/personal-learning-planner";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Планировщик обучения — Levio",
  description: "Планируйте ваше расписание на неделю отслеживайте прогресс.",
  robots: { index: false },
};
import { buildCareerSystem } from "@/lib/career/system";
import { getDashboardData } from "@/lib/dashboard/data";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";
import { parseQuizAccuracy } from "@/lib/utils/parse";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const profile = getOnboardingProfileFromCookie();
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  const quizAccuracy = dashboard
    ? parseQuizAccuracy(dashboard.stats.find((item) => item.id === "quiz-accuracy")?.value)
    : 0;

  const system = buildCareerSystem({
    role: profile.profession === "QA" ? "Junior QA" : profile.profession === "BA" ? "Junior BA" : "Junior Data Analyst",
    track: profile.profession,
    progressPercent: dashboard?.hero.overallProgress ?? 0,
    quizAccuracy,
    missionCompletionRate: dashboard
      ? Math.round((dashboard.weeklyQuests.filter((quest) => quest.status === "completed").length / Math.max(dashboard.weeklyQuests.length, 1)) * 100)
      : 0,
    simulationPerformance: dashboard
      ? Number.parseInt(dashboard.stats.find((item) => item.id === "simulations")?.value ?? "0", 10) * 12
      : 0,
    radar: dashboard?.skillRadar.data ?? [],
    interests: profile.interests,
    goal: profile.goal,
    weeklyHours: profile.hoursPerWeek,
  });

  return (
    <section className="page-shell">
      <div className="mb-4 flex justify-end">
        <Link href="/onboarding" className="btn-secondary gap-1.5 text-xs">
          <Settings2 className="w-3.5 h-3.5" />
          Изменить цель
        </Link>
      </div>
      <PersonalLearningPlanner initialPlan={system.plan} />
    </section>
  );
}

