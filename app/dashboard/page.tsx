import Link from "next/link";
import { BookOpen, Trophy, Target, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";


import { DashboardAiRecommendationsSection } from "@/components/dashboard/dashboard-ai-recommendations";
import { DashboardAdaptivePathSection } from "@/components/dashboard/dashboard-adaptive-path";
import { DashboardCareerPreviewSection } from "@/components/dashboard/dashboard-career-preview";
import { DashboardCurrentTracks } from "@/components/dashboard/dashboard-current-tracks";
import { DashboardDailyGoalSection } from "@/components/dashboard/dashboard-daily-goal";
import { DashboardHero, DashboardProgressSnapshotCard } from "@/components/dashboard/dashboard-hero";
import { DashboardFlameStreak } from "@/components/dashboard/dashboard-flame-streak";
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
import { ProductTourOverlay } from "@/components/saas/product-tour-overlay";
import { WeeklyAiReportCard } from "@/components/saas/weekly-ai-report-card";
import { AccordionSection } from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeInUp } from "@/components/ui/fade-in";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";
import { getTranslations } from "next-intl/server";

import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";
import { productTourSteps } from "@/lib/saas/tour";
import { getLevelIndex } from "@/lib/progress/xp";
import { CalendarCheck, Play } from "lucide-react";

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
  const [data, td] = await Promise.all([
    getDashboardData({
      preferredEmail: session?.user?.email,
      sessionRole: session?.user?.role,
    }),
    getTranslations("dashboard"),
  ]);

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

  const levelIndex = getLevelIndex(data.hero.level);

  return (
    <section className="page-shell text-foreground relative isolate overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none -z-10" />

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

        {currentTab === "overview" && data.saasGamification.streakMeta && (
          <div className="mb-6">
            <FadeInUp delay={0.05}>
              <DashboardFlameStreak 
                streak={data.saasGamification.streakMeta}
                challenge={data.saasGamification.dailyChallenge}
              />
            </FadeInUp>
          </div>
        )}

        {currentTab === "overview" && (
          <div className="mb-8">
            <FadeInUp delay={0.1}>
              <div className="surface-elevated overflow-hidden rounded-[32px] border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-1 backdrop-blur-xl shadow-[0_10px_40px_rgba(99,102,241,0.1)]">
                <div className="rounded-[28px] border border-border/50 bg-card/60 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
                    <div className="space-y-4 max-w-2xl text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <CalendarCheck className="h-5 w-5 text-indigo-400" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">{td("smartPlan.label")}</h2>
                      </div>
                      <div>
                        {data.upcomingActions.length > 0 ? (
                          <>
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                              {td("smartPlan.todayTask", { name: data.user.name })}{" "}
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{data.upcomingActions[0].title}</span>
                            </h3>
                            <p className="mt-2 text-foreground/70 leading-relaxed text-sm sm:text-base">
                              {data.upcomingActions[0].description}{" "}
                              {td("smartPlan.eta", { eta: data.upcomingActions[0].eta })}
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground">{td("smartPlan.allDone")}</h3>
                            <p className="mt-2 text-foreground/70 leading-relaxed text-sm sm:text-base">
                              {td("smartPlan.allDoneDesc")}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {data.upcomingActions.length > 0 && (
                      <Link
                        href={data.upcomingActions[0].href}
                        className="btn-primary min-w-[200px] shrink-0 gap-2 bg-foreground text-background shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-foreground/90 py-3 rounded-2xl flex justify-center group"
                      >
                        {td("smartPlan.startButton")}
                        <Play className="h-4 w-4 fill-current group-hover:translate-x-1 duration-300 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        )}

        {currentTab === "overview" ? (
          <div className="space-y-6">
            <FadeInUp delay={0.15}>
              <SectionErrorBoundary fallbackTitle={td("sections.focus.title")}>
                <AccordionSection
                  title={td("sections.focus.title")}
                  description={td("sections.focus.description")}
                  icon={<BookOpen className="h-6 w-6" />}
                  defaultOpen
                >
                  <div className="space-y-6">
                    <DashboardCurrentTracks tracks={data.tracks} />
                    <DashboardUpcomingActionsSection actions={data.upcomingActions} />
                  </div>
                </AccordionSection>
              </SectionErrorBoundary>
            </FadeInUp>

            <FadeInUp delay={0.15}>
              <SectionErrorBoundary fallbackTitle={td("sections.gamification.title")}>
                <AccordionSection
                  title={td("sections.gamification.title")}
                  description={td("sections.gamification.description")}
                  icon={<Trophy className="h-6 w-6" />}
                >
                  <div className="space-y-6">
                    <DashboardStatsGrid stats={data.stats} />
                    <DashboardDailyGoalSection goal={data.dailyGoal} />
                  </div>
                </AccordionSection>
              </SectionErrorBoundary>
            </FadeInUp>

            <FadeInUp delay={0.20}>
              <SectionErrorBoundary fallbackTitle={td("sections.practice.title")}>
                <AccordionSection
                  title={td("sections.practice.title")}
                  description={td("sections.practice.description")}
                  icon={<Target className="h-6 w-6" />}
                  isLocked={levelIndex < 2}
                  lockedMessage={td("sections.practice.locked")}
                  unlockHint={td("sections.practice.unlockHint")}
                >
                  <div className="space-y-6">
                    <DashboardWeeklyQuestsSection quests={data.weeklyQuests} />
                    <div className="grid gap-6 xl:grid-cols-2">
                      <DashboardMissionPreviewSection missions={data.missionPreview} />
                      <DashboardPlannerPreviewSection
                        goal={data.plannerPreview.goal}
                        workload={data.plannerPreview.workload}
                        forecastDate={data.plannerPreview.forecastDate}
                      />
                    </div>
                  </div>
                </AccordionSection>
              </SectionErrorBoundary>
            </FadeInUp>

            <FadeInUp delay={0.25}>
              <SectionErrorBoundary fallbackTitle={td("sections.advanced.title")}>
                <AccordionSection
                  title={td("sections.advanced.title")}
                  description={td("sections.advanced.description")}
                  icon={<Sparkles className="h-6 w-6" />}
                  isLocked={levelIndex < 3}
                  lockedMessage={td("sections.advanced.locked")}
                  unlockHint={td("sections.advanced.unlockHint")}
                >
                <div className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-2">
                    <section id="subscription" className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] space-y-3 p-5 sm:p-7">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="section-title">{td("subscription.title")}</h2>
                        <Link href="/billing" className="btn-secondary px-3 py-1.5 text-xs">
                          {td("subscription.manage")}
                        </Link>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {td("subscription.plan", { name: data.subscription.plan.name })}
                      </p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {data.subscription.usage.slice(0, 4).map((usage) => {
                          const meterLabel =
                            usage.meter === "aiMentorRequests" ? td("subscription.meters.aiMentorRequests") :
                            usage.meter === "missionSubmissions" ? td("subscription.meters.missionSubmissions") :
                            usage.meter === "interviewSessions" ? td("subscription.meters.interviewSessions") :
                            usage.meter === "jobApplications" ? td("subscription.meters.jobApplications") :
                            usage.meter;
                          return (
                            <article key={usage.meter} className="surface-subtle p-3">
                              <p className="text-xs text-muted-foreground">{meterLabel}</p>
                              <p className="text-sm font-semibold text-foreground">
                                {usage.used} / {usage.limit === null ? td("subscription.unlimited") : usage.limit}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                    <WeeklyAiReportCard report={data.weeklyAiReport} />
                  </div>
                  <DashboardRecentActivitySection activity={data.activity} />
                </div>
              </AccordionSection>
              </SectionErrorBoundary>
            </FadeInUp>
          </div>
        ) : null}

        {currentTab === "skills" ? (
          <>
            <FadeInUp delay={0.05}>
              <SectionErrorBoundary>
                <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                  <DashboardSkillRadarSection radar={data.skillRadar} />
                  <DashboardXpLevelSection xp={data.xp} weeklyProgress={data.weeklyProgress} />
                </div>
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.1}>
              <SectionErrorBoundary>
                <DashboardSkillEvolutionSection weeklyProgress={data.weeklyProgress} />
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.15}>
              <SectionErrorBoundary>
                <DashboardLearningHeatmapSection heatmap={data.heatmap} streak={data.xp.streak} />
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <SectionErrorBoundary>
                <div className="grid gap-6 xl:grid-cols-2">
                  <DashboardSkillTreePreviewSection skillTree={data.skillTree} />
                  <DashboardAiRecommendationsSection recommendations={data.recommendations} />
                </div>
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.25}>
              <SectionErrorBoundary>
                <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] space-y-3 p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="section-title">{td("skillsTab.recommendations.title")}</h2>
                    <Link href="/analytics/advanced" className="btn-secondary px-3 py-1.5 text-xs">
                      {td("skillsTab.recommendations.openAnalytics")}
                    </Link>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {data.smartRecommendations.map((item) => (
                      <article key={item.id} className="surface-subtle space-y-1 p-3">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                        <Link href={item.href} className="text-xs text-sky-300 hover:text-sky-200">
                          {td("skillsTab.recommendations.open")}
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <SectionErrorBoundary>
                <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] space-y-3 p-5 sm:p-7">
                  <h2 className="section-title">{td("skillsTab.achievements.title")}</h2>
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
                          {achievement.unlocked ? td("skillsTab.achievements.unlocked") : td("skillsTab.achievements.locked")}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.35}>
              <SectionErrorBoundary>
                <DashboardAdaptivePathSection suggestions={data.adaptiveSuggestions} />
              </SectionErrorBoundary>
            </FadeInUp>
          </>
        ) : null}

        {currentTab === "career" ? (
          <>
            <FadeInUp delay={0.05}>
              <SectionErrorBoundary>
                <DashboardCareerPreviewSection career={data.career} />
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.1}>
              <SectionErrorBoundary>
                <div className="grid gap-6 xl:grid-cols-2">
                  <DashboardJobMatchingPreviewSection jobs={data.jobMatchingPreview} />
                  <DashboardReviewPreviewSection
                    bookmarkCount={data.reviewPreview.bookmarkCount}
                    noteCount={data.reviewPreview.noteCount}
                  />
                </div>
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.15}>
              <SectionErrorBoundary>
                <DashboardPortfolioPreviewSection
                  totalEntries={data.portfolioPreview.totalEntries}
                  missionArtifacts={data.portfolioPreview.missionArtifacts}
                  recentEntryTitle={data.portfolioPreview.recentEntryTitle}
                />
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <SectionErrorBoundary>
                <DashboardInterviewPracticeSection />
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.25}>
              <SectionErrorBoundary>
                <DashboardLeaderboardPreviewSection leaderboard={data.leaderboard} />
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <SectionErrorBoundary>
                <section className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px] space-y-3 p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="section-title">{td("careerTab.marketplace.title")}</h2>
                    <Link href="/marketplace" className="btn-secondary px-3 py-1.5 text-xs">
                      {td("careerTab.marketplace.openButton")}
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">{td("careerTab.marketplace.profileUrl", { url: data.growth.publicProfileUrl })}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {data.jobMarketplace.topMatches.slice(0, 2).map((item) => (
                      <article key={item.roleId} className="surface-subtle p-3">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{td("careerTab.marketplace.matchPercent", { percent: item.matchPercent })}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.missingSkills.length > 0
                            ? td("careerTab.marketplace.missingSkills", { skills: item.missingSkills.join(", ") })
                            : td("careerTab.marketplace.noMissingSkills")}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              </SectionErrorBoundary>
            </FadeInUp>
            <FadeInUp delay={0.35}>
              <SectionErrorBoundary>
                <GrowthLoopCards cards={data.growth.cards} />
              </SectionErrorBoundary>
            </FadeInUp>
          </>
        ) : null}
      </DashboardLayout>
      <ProductTourOverlay steps={productTourSteps} />
    </section>
  );
}

export const metadata: import("next").Metadata = { title: "Dashboard — Levio", description: "Your learning dashboard: progress, XP, tracks, and career readiness.", robots: { index: false } };
