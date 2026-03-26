import Link from "next/link";
import { getServerSession } from "next-auth";

import { DashboardAiRecommendationsSection } from "@/components/dashboard/dashboard-ai-recommendations";
import { DashboardAdaptivePathSection } from "@/components/dashboard/dashboard-adaptive-path";
import { DashboardCareerPreviewSection } from "@/components/dashboard/dashboard-career-preview";
import { DashboardCurrentTracks } from "@/components/dashboard/dashboard-current-tracks";
import { DashboardDailyGoalSection } from "@/components/dashboard/dashboard-daily-goal";
import { DashboardHero, DashboardProgressSnapshotCard } from "@/components/dashboard/dashboard-hero";
import { DashboardInterviewPracticeSection } from "@/components/dashboard/dashboard-interview-practice";
import { DashboardInsightsPanel } from "@/components/dashboard/dashboard-insights-panel";
import { DashboardJobMatchingPreviewSection } from "@/components/dashboard/dashboard-job-matching-preview";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardLeaderboardPreviewSection } from "@/components/dashboard/dashboard-leaderboard-preview";
import { DashboardLearningHeatmapSection } from "@/components/dashboard/dashboard-learning-heatmap";
import { DashboardMissionPreviewSection } from "@/components/dashboard/dashboard-mission-preview";
import { DashboardPlannerPreviewSection } from "@/components/dashboard/dashboard-planner-preview";
import { DashboardPortfolioPreviewSection } from "@/components/dashboard/dashboard-portfolio-preview";
import { DashboardRecentActivitySection } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardReviewPreviewSection } from "@/components/dashboard/dashboard-review-preview";
import { DashboardSkillEvolutionSection } from "@/components/dashboard/dashboard-skill-evolution";
import { DashboardSkillRadarSection } from "@/components/dashboard/dashboard-skill-radar";
import { DashboardSkillTreePreviewSection } from "@/components/dashboard/dashboard-skill-tree-preview";
import { DashboardStatsGrid } from "@/components/dashboard/dashboard-stats-grid";
import { DashboardTab } from "@/components/dashboard/dashboard-tabs-nav";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DashboardUpcomingActionsSection } from "@/components/dashboard/dashboard-upcoming-actions";
import { DashboardWeeklyQuestsSection } from "@/components/dashboard/dashboard-weekly-quests";
import { DashboardXpLevelSection } from "@/components/dashboard/dashboard-xp-level";
import { GrowthLoopCards } from "@/components/saas/growth-loop-cards";
import { NotificationsCenter } from "@/components/saas/notifications-center";
import { ProductTourOverlay } from "@/components/saas/product-tour-overlay";
import { WeeklyAiReportCard } from "@/components/saas/weekly-ai-report-card";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";
import { productTourSteps } from "@/lib/saas/tour";

export const dynamic = "force-dynamic";

function resolveTab(value?: string): DashboardTab {
  if (value === "skills" || value === "career") {
    return value;
  }
  return "overview";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  const currentTab = resolveTab(searchParams?.tab);
  const data = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!data) {
    return (
      <EmptyState
        title="Dashboard data is empty"
        description="No user data found yet. Sign in and complete onboarding, or import initial content."
        actionLabel="Open tracks"
        actionHref="/tracks"
      />
    );
  }

  return (
    <section className="page-shell text-foreground">
      <DashboardLayout
        topbar={
          <DashboardTopbar
            name={data.user.name}
            role={data.user.role}
            currentTab={currentTab}
          />
        }
        insights={
          <DashboardInsightsPanel
            achievements={data.achievements}
            weeklyProgress={data.weeklyProgress}
            rank={data.leaderboard.currentUserRank}
            weeklyXp={data.leaderboard.earnedXpThisWeek}
            skillRadar={data.skillRadar}
          />
        }
      >
        <DashboardHero
          id="hero"
          name={data.user.name}
          role={data.user.role}
          isDemoUser={data.user.isDemoUser}
          completedModules={data.hero.completedModules}
          totalModules={data.hero.totalModules}
          primaryTrackTitle={data.hero.primaryTrackTitle}
          level={data.hero.level}
          totalXp={data.hero.totalXp}
          learningStreakDays={data.hero.learningStreakDays}
          overallSkillLevel={data.hero.overallSkillLevel}
          trackCompletionEstimate={data.hero.trackCompletionEstimate}
          continueHref={data.hero.continueHref}
          roadmapHref={data.hero.roadmapHref}
          mentorHref={data.hero.mentorHref}
        />
        <DashboardProgressSnapshotCard
          overallProgress={data.hero.overallProgress}
          primaryTrackTitle={data.hero.primaryTrackTitle}
          primaryTrackProgress={data.hero.primaryTrackProgress}
          completedModules={data.hero.completedModules}
          learningStreakDays={data.hero.learningStreakDays}
          trackCompletionEstimate={data.hero.trackCompletionEstimate}
        />

        {currentTab === "overview" ? (
          <>
            <DashboardStatsGrid stats={data.stats} />
            <DashboardDailyGoalSection goal={data.dailyGoal} />
            <DashboardCurrentTracks tracks={data.tracks} />
            <DashboardUpcomingActionsSection actions={data.upcomingActions} />
            <DashboardWeeklyQuestsSection quests={data.weeklyQuests} />
            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardMissionPreviewSection missions={data.missionPreview} />
              <DashboardPlannerPreviewSection
                goal={data.plannerPreview.goal}
                workload={data.plannerPreview.workload}
                forecastDate={data.plannerPreview.forecastDate}
              />
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <section id="subscription" className="surface-elevated space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="section-title">Subscription</h2>
                  <Link href="/billing" className="btn-secondary px-3 py-1.5 text-xs">
                    Manage plan
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Plan: {data.subscription.plan.name} ({data.subscription.state.planId})
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {data.subscription.usage.slice(0, 4).map((usage) => (
                    <article key={usage.meter} className="surface-subtle p-3">
                      <p className="text-xs text-muted-foreground">{usage.meter}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {usage.used} / {usage.limit === null ? "Unlimited" : usage.limit}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
              <WeeklyAiReportCard report={data.weeklyAiReport} />
            </div>
            <DashboardRecentActivitySection activity={data.activity} />
            <NotificationsCenter notifications={data.notifications} />
          </>
        ) : null}

        {currentTab === "skills" ? (
          <>
            <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <DashboardSkillRadarSection radar={data.skillRadar} />
              <DashboardXpLevelSection xp={data.xp} weeklyProgress={data.weeklyProgress} />
            </div>
            <DashboardSkillEvolutionSection weeklyProgress={data.weeklyProgress} />
            <DashboardLearningHeatmapSection heatmap={data.heatmap} streak={data.xp.streak} />
            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardSkillTreePreviewSection skillTree={data.skillTree} />
              <DashboardAiRecommendationsSection recommendations={data.recommendations} />
            </div>
            <section className="surface-elevated space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="section-title">Smart recommendations</h2>
                <Link href="/analytics/advanced" className="btn-secondary px-3 py-1.5 text-xs">
                  Open advanced analytics
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {data.smartRecommendations.map((item) => (
                  <article key={item.id} className="surface-subtle space-y-1 p-3">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                    <Link href={item.href} className="text-xs text-sky-300 hover:text-sky-200">
                      Open
                    </Link>
                  </article>
                ))}
              </div>
            </section>
            <section className="surface-elevated space-y-3 p-5">
              <h2 className="section-title">Gamification achievements</h2>
              <div className="flex flex-wrap gap-2">
                {data.saasGamification.badges.map((badge) => (
                  <span key={badge.id} className="chip-neutral px-2.5 py-1 text-xs">
                    {badge.label}
                  </span>
                ))}
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {data.saasGamification.achievements.map((achievement) => (
                  <article key={achievement.id} className="surface-subtle p-3">
                    <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className={`text-xs ${achievement.unlocked ? "text-emerald-300" : "text-muted-foreground"}`}>
                      {achievement.unlocked ? "Unlocked" : "Locked"}
                    </p>
                  </article>
                ))}
              </div>
            </section>
            <DashboardAdaptivePathSection suggestions={data.adaptiveSuggestions} />
          </>
        ) : null}

        {currentTab === "career" ? (
          <>
            <DashboardCareerPreviewSection career={data.career} />
            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardJobMatchingPreviewSection jobs={data.jobMatchingPreview} />
              <DashboardReviewPreviewSection
                bookmarkCount={data.reviewPreview.bookmarkCount}
                noteCount={data.reviewPreview.noteCount}
              />
            </div>
            <DashboardPortfolioPreviewSection
              totalEntries={data.portfolioPreview.totalEntries}
              missionArtifacts={data.portfolioPreview.missionArtifacts}
              recentEntryTitle={data.portfolioPreview.recentEntryTitle}
            />
            <DashboardInterviewPracticeSection />
            <DashboardLeaderboardPreviewSection leaderboard={data.leaderboard} />
            <section className="surface-elevated space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="section-title">Public profile and marketplace</h2>
                <Link href="/marketplace" className="btn-secondary px-3 py-1.5 text-xs">
                  Open hiring marketplace
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">Public profile URL: {data.growth.publicProfileUrl}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {data.jobMarketplace.topMatches.slice(0, 2).map((item) => (
                  <article key={item.roleId} className="surface-subtle p-3">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Match: {item.matchPercent}%</p>
                    <p className="text-xs text-muted-foreground">
                      Missing: {item.missingSkills.length > 0 ? item.missingSkills.join(", ") : "None"}
                    </p>
                  </article>
                ))}
              </div>
            </section>
            <GrowthLoopCards cards={data.growth.cards} />
          </>
        ) : null}
      </DashboardLayout>
      <ProductTourOverlay steps={productTourSteps} />
    </section>
  );
}
