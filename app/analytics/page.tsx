import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { StudentAnalyticsDashboard } from "@/components/analytics/student-analytics-dashboard";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Analytics — SkillPath Academy",
  description: "Track your learning progress, quiz scores, and XP growth over time.",
  robots: { index: false },
};
import { getDashboardData } from "@/lib/dashboard/data";
import { StudentAnalyticsSnapshot } from "@/types/personalization";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function parsePercent(value: string | undefined) {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseInt(value.replace("%", ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseIntValue(value: string | undefined) {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  const quizAccuracy = dashboard
    ? parsePercent(dashboard.stats.find((item) => item.id === "quiz-accuracy")?.value)
    : 0;
  const completedLessons = dashboard
    ? parseIntValue(dashboard.stats.find((item) => item.id === "completed-lessons")?.value)
    : 0;
  const simulationCount = dashboard
    ? parseIntValue(dashboard.stats.find((item) => item.id === "simulations")?.value)
    : 0;
  const missionCompletionRate = dashboard
    ? Math.round(
        (dashboard.weeklyQuests.filter((quest) => quest.status === "completed").length
          / Math.max(dashboard.weeklyQuests.length, 1)) * 100,
      )
    : 0;
  const strongestSkills = dashboard
    ? [...dashboard.skillRadar.data].sort((a, b) => b.value - a.value).slice(0, 3).map((item) => item.skill)
    : [];
  const weakestSkills = dashboard
    ? [...dashboard.skillRadar.data].sort((a, b) => a.value - b.value).slice(0, 3).map((item) => item.skill)
    : [];

  const snapshot: StudentAnalyticsSnapshot = {
    totalLearningMinutes: completedLessons * 35 + (dashboard?.hero.completedModules ?? 0) * 20,
    completedLessons,
    weeklyProgress: dashboard
      ? dashboard.weeklyProgress.map((item) => ({
          week: item.week,
          value: item.progress,
        }))
      : [],
    strongestSkills,
    weakestSkills,
    averageQuizAccuracy: quizAccuracy,
    missionCompletionRate,
    simulationPerformance: clamp(simulationCount * 12),
    trend: dashboard
      ? dashboard.weeklyProgress.map((item, index, list) => ({
          label: item.week,
          progress: item.progress,
          accuracy: clamp(quizAccuracy - Math.max(0, list.length - index - 1) * 2),
        }))
      : [],
  };

  return (
    <section className="page-shell">
      <StudentAnalyticsDashboard snapshot={snapshot} />
    </section>
  );
}
