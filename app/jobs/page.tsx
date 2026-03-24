import { getServerSession } from "next-auth";

import { JobMatchingBoard } from "@/components/jobs/job-matching-board";
import { authOptions } from "@/lib/auth";
import { buildCareerSystem } from "@/lib/career/system";
import { getDashboardData } from "@/lib/dashboard/data";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";

export const dynamic = "force-dynamic";

function parseQuizAccuracy(value: string | undefined) {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseInt(value.replace("%", ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function JobsPage() {
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
      <JobMatchingBoard jobs={system.jobs} />
    </section>
  );
}

