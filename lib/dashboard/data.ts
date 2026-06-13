import "server-only";

import { Prisma, ProgressStatus, TrackCategory, UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";

import type { HeatmapCell } from "@/features/analytics/learning-heatmap";
import { buildLeaderboard, type LeaderboardRow } from "@/features/gamification/leaderboard";
import { missionXpSummary } from "@/features/missions/engine";
import { buildCareerSummary } from "@/lib/dashboard/career-data";
import {
  buildDashboardRecommendations,
  getTrackCareerImpact,
  getTrackSkills,
} from "@/lib/dashboard/recommendations-data";
import {
  buildHeatmapFromCompletedAt,
  buildWeeklyProgressData,
  calculateCurrentStreak,
  clamp,
  formatDuration,
} from "@/lib/dashboard/progress-data";
import {
  buildSkillRadarData,
  buildSkillTreePreview,
  overallSkillLevelFromRadar,
} from "@/lib/dashboard/skills-data";
import { getServerEnv } from "@/lib/config/env";
import { MAX_LEADERBOARD_USERS } from "@/lib/config/limits";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import { resolveRuntimeCatalog } from "@/lib/learning/content-resolver";
import { buildJobMatches } from "@/lib/matching/jobs";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";
import { calculateXpFromProgress, getLevelByXp, getNextLevelTarget, type LevelTier } from "@/lib/progress/xp";
import { prisma } from "@/lib/prisma";
import { getAdaptivePath } from "@/lib/recommendations/adaptive-path";
import { buildLearningRecommendations } from "@/lib/recommendations/learning-recommendations";
import { AdaptiveSuggestion, JobPosting, LearningMission, WeeklyQuest } from "@/types/personalization";
import { mapRuntimeCatalogToMissions } from "@/lib/missions/runtime-missions";
import { buildAdvancedLearningAnalytics } from "@/lib/saas/analytics";
import { buildAchievements as buildSaasAchievements, toBadges as toSaasBadges } from "@/lib/saas/gamification";
import { checkFeatureAccess, getUsageChecks } from "@/lib/saas/gating";
import { buildGrowthShareCards } from "@/lib/saas/growth";
import { listMarketplaceRoles } from "@/lib/saas/marketplace";
import { buildSaasJobMatches } from "@/lib/saas/matching";
import { buildDashboardNotifications } from "@/lib/saas/notifications";
import { getPlanById } from "@/lib/saas/plans";
import { buildPublicProfileSnapshot, toPublicHandle } from "@/lib/saas/public-profile";
import { buildSmartRecommendations } from "@/lib/saas/recommendations";
import { buildStreakSummary } from "@/lib/saas/streaks";
import { resolveUserSubscription } from "@/lib/saas/subscriptions";
import { buildTeamAnalytics } from "@/lib/saas/teams";
import {
  AdvancedLearningAnalytics,
  Achievement as SaasAchievement,
  Badge,
  GrowthShareCard,
  JobMatch,
  MeterUsageCheck,
  NotificationItem,
  PublicProfileSnapshot,
  SmartRecommendation,
  StreakSummary,
  SubscriptionPlan,
  SubscriptionState,
  TeamAnalyticsSnapshot,
  TeamMemberProgress,
  WeeklyAiReport,
} from "@/types/saas";

type SessionRole = "ADMIN" | "STUDENT" | "PRO_STUDENT" | "MENTOR" | "RECRUITER" | undefined;

export type DashboardSectionNavItem = {
  id: string;
  label: string;
};

export type DashboardStatCard = {
  id: "completed-lessons" | "active-tracks" | "total-xp" | "quiz-accuracy" | "weekly-streak" | "simulations";
  label: string;
  value: string;
  helper: string;
};

export type DashboardTrackCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: TrackCategory;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  inProgressModules: number;
  averageScore: number | null;
  nextModuleTitle: string | null;
  nextModuleHref: string;
  estimatedCompletion: string;
  skillsGained: string[];
  careerImpact: string;
  modulePreview: Array<{
    id: string;
    title: string;
    status: ProgressStatus;
  }>;
};

export type DashboardSkillRadar = {
  data: Array<{ skill: string; value: number }>;
  strongestSkill: string;
  weakestSkill: string;
  nextFocus: string;
};

export type DashboardSkillBranchPreview = {
  id: string;
  title: string;
  category: TrackCategory;
  unlocked: string[];
  locked: string[];
};

export type DashboardRecommendation = {
  id: string;
  title: string;
  description: string;
  tag: "Quiz" | "Simulation" | "Skill" | "Career" | "Mentor";
  href: string;
};

export type DashboardActivityItem = {
  id: string;
  title: string;
  description: string;
  kind: "lesson" | "quiz" | "skill" | "badge" | "simulation" | "certificate";
  timestamp: Date;
};

export type DashboardUpcomingAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: "High" | "Medium" | "Low";
  difficulty: "Low" | "Medium" | "High";
  xpReward: number;
  skillImpact: string;
  eta: string;
};

export type DashboardAchievement = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

export type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "STUDENT";
    isDemoUser: boolean;
  };
  hero: {
    overallProgress: number;
    completedModules: number;
    totalModules: number;
    primaryTrackTitle: string;
    primaryTrackProgress: number;
    totalXp: number;
    learningStreakDays: number;
    overallSkillLevel: string;
    trackCompletionEstimate: string;
    level: LevelTier;
    continueHref: string;
    roadmapHref: string;
    mentorHref: string;
  };
  stats: DashboardStatCard[];
  tracks: DashboardTrackCard[];
  activeTrackCount: number;
  skillRadar: DashboardSkillRadar;
  xp: {
    totalXp: number;
    currentLevel: LevelTier;
    nextLevel: LevelTier | null;
    progressPercent: number;
    xpNeededForNext: number;
    streak: number;
    badgesCount: number;
    badges: string[];
    weeklyXp: number;
  };
  heatmap: {
    data: HeatmapCell[];
    mode: "real" | "mock";
  };
  skillTree: {
    branches: DashboardSkillBranchPreview[];
    unlockedCount: number;
    totalCount: number;
    nextUnlock: string | null;
  };
  recommendations: DashboardRecommendation[];
  leaderboard: {
    rows: LeaderboardRow[];
    currentUserRank: number | null;
    earnedXpThisWeek: number;
  };
  activity: DashboardActivityItem[];
  career: {
    currentStage: "Junior" | "Middle" | "Senior";
    nextStage: "Junior" | "Middle" | "Senior" | null;
    progressToNextStage: number;
    missingSkills: string[];
    focusTrack: string;
  };
  upcomingActions: DashboardUpcomingAction[];
  achievements: DashboardAchievement[];
  adaptiveSuggestions: AdaptiveSuggestion[];
  weeklyQuests: WeeklyQuest[];
  missionPreview: Array<{
    id: string;
    title: string;
    scenario: string;
    xpReward: number;
    status: string;
  }>;
  plannerPreview: {
    goal: string;
    workload: string;
    forecastDate: string;
  };
  jobMatchingPreview: Array<{
    id: string;
    title: string;
    matchPercent: number;
    missingRequirements: string[];
  }>;
  reviewPreview: {
    bookmarkCount: number;
    noteCount: number;
    mistakeCount: number;
  };
  portfolioPreview: {
    totalEntries: number;
    missionArtifacts: number;
    recentEntryTitle: string | null;
  };
  weeklyProgress: Array<{
    week: string;
    progress: number;
    completed: number;
  }>;
  dailyGoal: {
    targetLessons: number;
    completedLessons: number;
    targetXp: number;
    earnedXp: number;
  };
  subscription: {
    state: SubscriptionState;
    plan: SubscriptionPlan;
    usage: MeterUsageCheck[];
    gates: {
      aiMentor: ReturnType<typeof checkFeatureAccess>;
      interviewMode: ReturnType<typeof checkFeatureAccess>;
      readinessAnalytics: ReturnType<typeof checkFeatureAccess>;
      hiringMarketplace: ReturnType<typeof checkFeatureAccess>;
      teamDashboard: ReturnType<typeof checkFeatureAccess>;
    };
  };
  saasAnalytics: AdvancedLearningAnalytics;
  saasGamification: {
    achievements: SaasAchievement[];
    badges: Badge[];
    streakMeta: {
      currentStreak: number;
      longestStreak: number;
      streakFreezes: number;
      isActiveToday: boolean;
    };
    dailyChallenge: {
      challengeType: string;
      title: string;
      goal: number;
      progress: number;
      isCompleted: boolean;
      xpReward: number;
    } | null;
  };
  streaks: StreakSummary;
  smartRecommendations: SmartRecommendation[];
  notifications: NotificationItem[];
  weeklyAiReport: WeeklyAiReport;
  growth: {
    publicProfileUrl: string;
    cards: GrowthShareCard[];
  };
  publicProfile: PublicProfileSnapshot;
  jobMarketplace: {
    topMatches: JobMatch[];
  };
  teamLearning: TeamAnalyticsSnapshot | null;
  sectionNav: DashboardSectionNavItem[];
};

const sectionNav: DashboardSectionNavItem[] = [
  { id: "hero", label: "Overview" },
  { id: "tracks", label: "Tracks" },
  { id: "skills", label: "Skill radar" },
  { id: "xp", label: "XP & level" },
  { id: "heatmap", label: "Heatmap" },
  { id: "tree", label: "Skill tree" },
  { id: "adaptive", label: "Adaptive path" },
  { id: "ai", label: "AI recommendations" },
  { id: "quests", label: "Weekly quests" },
  { id: "missions", label: "Missions" },
  { id: "planner", label: "Planner" },
  { id: "subscription", label: "Subscription" },
  { id: "notifications", label: "Notifications" },
  { id: "report", label: "Weekly report" },
  { id: "jobs", label: "Jobs" },
  { id: "review", label: "Review" },
  { id: "growth", label: "Growth" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "activity", label: "Activity" },
  { id: "career", label: "Career" },
  { id: "actions", label: "Next actions" },
];

const userInclude = {
  progresses: {
    include: {
      module: {
        include: {
          track: true,
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
  },
  certificates: {
    include: {
      track: true,
    },
  },
  courseCertificates: {
    include: {
      course: true,
    },
  },
  userStreak: true,
  dailyChallenges: {
    orderBy: { date: "desc" },
    take: 1,
  },
} satisfies Prisma.UserInclude;

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function resolveDashboardUser(preferredEmail?: string | null) {
  // Build candidate list from authenticated session email first, then the
  // configured demo email (only when demo mode is explicitly enabled).
  // Hardcoded fallback addresses are intentionally removed: in production a
  // missing session must return null rather than serve another user's data.
  const demoEmail = isDemoModeEnabled() ? getServerEnv().demoUserEmail : null;
  const candidates = [preferredEmail, demoEmail].filter(
    (e): e is string => typeof e === "string" && e.length > 0,
  );

  for (const email of candidates) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: userInclude,
    });

    if (user) {
      // Ensure UserStreak and DailyChallenge exist/upsert
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // We explicitly upsert the UserStreak in the Dashboard just to guarantee the dashboard never crashes if a new user visits it.
      // In production, this would be part of a signup hook.
      let userStreak = await prisma.userStreak.findUnique({ where: { userId: user.id } });
      if (!userStreak) {
        userStreak = await prisma.userStreak.create({
          data: { userId: user.id, currentStreak: 1, lastActivityDate: new Date() }
        });
      }

      // Check for an active daily challenge today
      let dailyChallenge = await prisma.dailyChallenge.findFirst({
        where: { userId: user.id, date: { gte: today } }
      });
      if (!dailyChallenge) {
        dailyChallenge = await prisma.dailyChallenge.create({
          data: {
            userId: user.id,
            challengeType: "COMPLETE_LESSON",
            goal: 3,
            xpReward: 100,
            date: today,
          }
        });
      }

      return { ...user, userStreak, dailyChallenges: [dailyChallenge] };
    }
  }

  // Last resort: first registered user — only safe in single-tenant demo mode.
  // In production this path is unreachable because preferredEmail is always
  // populated from the authenticated session.
  if (isDemoModeEnabled()) {
    return prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      include: userInclude,
    });
  }

  return null;
}

type TrackSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  source: string;
  category: TrackCategory;
  completedModules: number;
  inProgressModules: number;
  startedModules: number;
  totalModules: number;
  progressPercent: number;
  averageScore: number | null;
  nextModuleTitle: string | null;
  nextModuleHref: string;
  estimatedCompletion: string;
  completedLessons: number;
  modulePreview: Array<{
    id: string;
    title: string;
    status: ProgressStatus;
  }>;
};

function toTrackCategory(value: string): TrackCategory {
  if (value === TrackCategory.QA || value === TrackCategory.BA || value === TrackCategory.DA) {
    return value;
  }
  return TrackCategory.QA;
}

function parseStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapPostingTrack(value: TrackCategory | null | undefined): "QA" | "BA" | "DA" {
  if (value === TrackCategory.BA) {
    return "BA";
  }
  if (value === TrackCategory.DA) {
    return "DA";
  }
  return "QA";
}

function mapJobLevel(value: string): JobPosting["level"] {
  if (value === "Intern" || value === "Junior+") {
    return value;
  }
  return "Junior";
}

function buildDefaultPlanPreview(goal: string, weeklyHours: number) {
  const forecast = new Date();
  forecast.setDate(forecast.getDate() + Math.max(28, Math.round((12 - Math.min(weeklyHours, 10)) * 6)));
  const workload = weeklyHours >= 8 ? "Intense" : weeklyHours >= 5 ? "Balanced" : "Light";

  return {
    goal,
    workload,
    forecastDate: forecast.toISOString(),
  };
}

function defaultSkillsByTrackTag(track: "QA" | "BA" | "DA") {
  if (track === "BA") {
    return ["User Stories", "Requirements", "Communication"];
  }
  if (track === "DA") {
    return ["SQL", "Analytics", "Visualization"];
  }
  return ["Testing", "API Testing", "Bug Reporting"];
}

function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as { code?: unknown; message?: unknown };
  if (record.code === "P2021") {
    return true;
  }

  return typeof record.message === "string" && record.message.includes("does not exist");
}

async function withOptionalTableFallback<T>(query: Promise<T>, fallback: T): Promise<T> {
  try {
    return await query;
  } catch (error) {
    if (isMissingTableError(error)) {
      return fallback;
    }
    throw error;
  }
}

export async function getDashboardData(params: {
  preferredEmail?: string | null;
  sessionRole?: SessionRole;
}): Promise<DashboardData | null> {
  const preferredEmail = params.preferredEmail ?? null;
  const sessionRole = params.sessionRole;

  const td = await getTranslations("dashboard.data");

  let user: Awaited<ReturnType<typeof resolveDashboardUser>>;
  let runtimeCatalog: Awaited<ReturnType<typeof resolveRuntimeCatalog>>;
  let leaderboardUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    progresses: Array<{ status: ProgressStatus; score: number | null }>;
    _count: { certificates: number; courseCertificates: number };
    userStreak: { currentStreak: number } | null;
  }>;

  try {
    [user, runtimeCatalog, leaderboardUsers] = await Promise.all([
      resolveDashboardUser(preferredEmail),
      resolveRuntimeCatalog({ includeCourseEntities: true }),
      prisma.user.findMany({
        // Cap leaderboard to avoid full-table scans as the user base grows.
        // Top-N ranking is sufficient for motivational display purposes.
        take: MAX_LEADERBOARD_USERS,
        select: {
          id: true,
          name: true,
          email: true,
          progresses: {
            select: {
              status: true,
              score: true,
            },
          },
          _count: {
            select: {
              certificates: true,
              courseCertificates: true,
            },
          },
          userStreak: {
            select: {
              currentStreak: true,
            },
          },
        },
      }),
    ]);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[dashboard] Failed to resolve dashboard bootstrap data", error);
    }
    return null;
  }

  if (!user) {
    return null;
  }

  const role: "ADMIN" | "STUDENT" =
    sessionRole === "ADMIN" || user.role === UserRole.ADMIN ? "ADMIN" : "STUDENT";
  const subscriptionState = await resolveUserSubscription({
    userId: user.id,
    userEmail: user.email,
    role,
  });
  const subscriptionPlan = getPlanById(subscriptionState.planId);
  const subscriptionUsage = getUsageChecks(subscriptionState);
  const subscriptionGates = {
    aiMentor: checkFeatureAccess(subscriptionState, "ai.mentor"),
    interviewMode: checkFeatureAccess(subscriptionState, "interview.mode"),
    readinessAnalytics: checkFeatureAccess(subscriptionState, "readiness.analytics"),
    hiringMarketplace: checkFeatureAccess(subscriptionState, "hiring.marketplace"),
    teamDashboard: checkFeatureAccess(subscriptionState, "teams.dashboard"),
  };
  const hasUnlimitedMissions = checkFeatureAccess(subscriptionState, "missions.unlimited").allowed;

  const [
    missionRows,
    jobPostingRows,
    weeklyQuestRows,
    noteCount,
    bookmarkCount,
    quizReviewRows,
    activeLearningPlan,
  ] = await Promise.all([
    withOptionalTableFallback(
      prisma.learningMission.findMany({
        where: { status: "PUBLISHED" },
        include: {
          submissions: {
            where: { userId: user.id },
            select: {
              status: true,
              score: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      [] as Array<
        Prisma.LearningMissionGetPayload<{
          include: {
            submissions: {
              select: {
                status: true;
                score: true;
              };
            };
          };
        }>
      >,
    ),
    withOptionalTableFallback(
      prisma.jobPosting.findMany({
        where: { status: "PUBLISHED" },
        include: {
          role: {
            select: {
              track: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      [] as Array<
        Prisma.JobPostingGetPayload<{
          include: {
            role: {
              select: {
                track: true;
              };
            };
          };
        }>
      >,
    ),
    withOptionalTableFallback(
      prisma.weeklyQuest.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      [] as Awaited<ReturnType<typeof prisma.weeklyQuest.findMany>>,
    ),
    withOptionalTableFallback(
      prisma.userNote.count({
        where: { userId: user.id },
      }),
      0,
    ),
    withOptionalTableFallback(
      prisma.userBookmark.count({
        where: { userId: user.id },
      }),
      0,
    ),
    withOptionalTableFallback(
      prisma.quizQuestionResult.findMany({
        where: {
          attempt: { userId: user.id },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
          questionId: true,
          isCorrect: true,
        },
      }),
      [] as Array<{ questionId: string; isCorrect: boolean }>,
    ),
    withOptionalTableFallback(
      prisma.learningPlan.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        select: {
          goal: true,
          workload: true,
          forecastDate: true,
        },
      }),
      null as Prisma.LearningPlanGetPayload<{
        select: {
          goal: true;
          workload: true;
          forecastDate: true;
        };
      }> | null,
    ),
  ]);

  const tracks = runtimeCatalog.courses
    .filter((course) => course.category === "QA" || course.category === "BA" || course.category === "DA")
    .sort((a, b) => a.title.localeCompare(b.title));

  const progressByModuleId = new Map(user.progresses.map((progress) => [progress.moduleId, progress]));

  const trackSummaries: TrackSummary[] = tracks.map((track) => {
    const moduleState = track.modules.map((moduleItem) => {
      const progress = progressByModuleId.get(moduleItem.id);
      const status = progress?.status ?? ProgressStatus.NOT_STARTED;

      return {
        id: moduleItem.id,
        title: moduleItem.title,
        status,
        lessonsCount: moduleItem.lessons.length,
        duration: moduleItem.estimatedDuration,
        score: progress?.score ?? null,
      };
    });

    const completedModules = moduleState.filter((item) => item.status === ProgressStatus.COMPLETED).length;
    const inProgressModules = moduleState.filter((item) => item.status === ProgressStatus.IN_PROGRESS).length;
    const startedModules = moduleState.filter((item) => item.status !== ProgressStatus.NOT_STARTED).length;
    const totalModules = moduleState.length;
    const scores = moduleState.map((item) => item.score).filter((item): item is number => item !== null);
    const nextModule = moduleState.find((item) => item.status !== ProgressStatus.COMPLETED) ?? moduleState[0];
    const remainingDuration = moduleState
      .filter((item) => item.status !== ProgressStatus.COMPLETED)
      .reduce((sum, item) => sum + item.duration, 0);
    const completedLessons = moduleState
      .filter((item) => item.status === ProgressStatus.COMPLETED)
      .reduce((sum, item) => sum + item.lessonsCount, 0);

    return {
      id: track.id,
      slug: track.slug,
      title: track.title,
      description: track.description,
      source: track.source,
      category: toTrackCategory(track.category),
      completedModules,
      inProgressModules,
      startedModules,
      totalModules,
      progressPercent: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
      nextModuleTitle: nextModule?.title ?? null,
      nextModuleHref:
        nextModule && track.source === "prisma-track"
          ? `/tracks/${track.slug}/modules/${nextModule.id}`
          : `/tracks/${track.slug}`,
      estimatedCompletion: formatDuration(remainingDuration),
      completedLessons,
      modulePreview: moduleState.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
      })),
    };
  });

  const totalModules = trackSummaries.reduce((sum, track) => sum + track.totalModules, 0);
  const completedModules = trackSummaries.reduce((sum, track) => sum + track.completedModules, 0);
  const activeTrackCount = trackSummaries.filter((track) => track.startedModules > 0).length;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const scoreList = user.progresses.map((progress) => progress.score).filter((score): score is number => score !== null);
  const quizAccuracy = scoreList.length > 0 ? Math.round(scoreList.reduce((sum, score) => sum + score, 0) / scoreList.length) : 0;
  const passedQuizzes = scoreList.filter((score) => score >= 70).length;
  const bestScore = scoreList.length > 0 ? Math.max(...scoreList) : 0;

  const completedDates = user.progresses
    .map((progress) => progress.completedAt)
    .filter((completedAt): completedAt is Date => Boolean(completedAt));
  const streak = calculateCurrentStreak(completedDates);
  const weeklyProgress = buildWeeklyProgressData(completedDates, totalModules);

  const completedLessons = trackSummaries.reduce((sum, track) => sum + track.completedLessons, 0);
  const simulationsCompletedEstimate = Math.floor(completedModules / 2);

  const certificateCount = user.certificates.length + user.courseCertificates.length;

  const xpBreakdown = calculateXpFromProgress(
    user.progresses.map((progress) => ({
      status: progress.status,
      score: progress.score,
    })),
    certificateCount,
    completedLessons,
    simulationsCompletedEstimate,
  );
  const levelProgress = getNextLevelTarget(xpBreakdown.totalXp);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyCompleted = user.progresses.filter(
    (progress) => progress.completedAt && progress.completedAt >= weekAgo && progress.status === ProgressStatus.COMPLETED,
  ).length;
  const weeklyPassed = user.progresses.filter(
    (progress) => progress.completedAt && progress.completedAt >= weekAgo && (progress.score ?? 0) >= 70,
  ).length;
  const earnedXpThisWeek = weeklyCompleted * 50 + weeklyPassed * 80;

  const primaryTrack =
    [...trackSummaries]
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .find((track) => track.startedModules > 0) ??
    [...trackSummaries].sort((a, b) => b.progressPercent - a.progressPercent)[0];

  const skillRadar = buildSkillRadarData(trackSummaries, overallProgress, quizAccuracy);
  const skillTree = buildSkillTreePreview(trackSummaries);
  const career = buildCareerSummary(xpBreakdown.totalXp, skillRadar);
  const heatmap = buildHeatmapFromCompletedAt(completedDates, 84);

  const groupedLeaderboard = buildLeaderboard(
    leaderboardUsers.map((item) => ({
      id: item.id,
      name: item.name ?? "Levio User",
      email: item.email,
      progresses: item.progresses,
      certificates: item._count.certificates + item._count.courseCertificates,
      streak: item.userStreak,
    })),
  );

  const flatLeaderboardRows = [
    ...groupedLeaderboard.Diamond,
    ...groupedLeaderboard.Gold,
    ...groupedLeaderboard.Silver,
    ...groupedLeaderboard.Bronze,
  ].sort((a, b) => a.rank - b.rank);

  const leaderboard = {
    rows: flatLeaderboardRows.slice(0, 5),
    currentUserRank: flatLeaderboardRows.find((row) => row.userId === user.id)?.rank ?? null,
    earnedXpThisWeek,
  };

  const badges = [
    completedModules >= 1 ? "First module complete" : null,
    completedModules >= 5 ? "Consistent learner" : null,
    quizAccuracy >= 80 ? "Quiz precision" : null,
    streak >= 5 ? "Focus streak" : null,
    certificateCount >= 1 ? "Certified specialist" : null,
  ].filter((item): item is string => Boolean(item));

  const lowScoreProgressRecord = user.progresses
    .filter((progress) => progress.score !== null && progress.score < 70)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  const lowScoreProgress = lowScoreProgressRecord
    ? {
        moduleId: lowScoreProgressRecord.moduleId,
        moduleTitle: lowScoreProgressRecord.module.title,
        score: lowScoreProgressRecord.score ?? 0,
        trackSlug: lowScoreProgressRecord.module.track.slug,
      }
    : null;

  const strongestCategory =
    [...trackSummaries].sort((a, b) => b.progressPercent - a.progressPercent)[0]?.category ?? TrackCategory.QA;
  const categoryTrack = trackSummaries.find((track) => track.category === strongestCategory) ?? trackSummaries[0];

  const baseRecommendations = buildLearningRecommendations(
    trackSummaries.map((track) => ({
      category: track.category,
      progressPercent: track.progressPercent,
      averageScore: track.averageScore,
      completedModules: track.completedModules,
      totalModules: track.totalModules,
    })),
  );

  const recommendations: DashboardRecommendation[] = buildDashboardRecommendations({
    lowScoreProgress,
    primaryTrack: primaryTrack
      ? {
          title: primaryTrack.title,
          category: primaryTrack.category,
          nextModuleHref: primaryTrack.nextModuleHref,
          nextModuleTitle: primaryTrack.nextModuleTitle,
        }
      : null,
    strongestCategory,
    skillRadar,
    focusTrack: career.focusTrack,
    categoryTrackTitle: categoryTrack?.title,
    baseRecommendationText: baseRecommendations[0],
  });

  const onboardingProfile = await getOnboardingProfileFromCookie();
  const adaptiveSignal = {
    quizAccuracy,
    frequentMistakes: lowScoreProgress
      ? [`Reinforce module ${lowScoreProgress.moduleTitle}`]
      : ["Maintain consistency in weak-skill modules"],
    timeSpentMinutes: completedLessons * 35 + completedModules * 20,
    completedModules,
    skippedLessons: Math.max(0, totalModules - completedModules - user.progresses.filter((item) => item.status === ProgressStatus.IN_PROGRESS).length),
    simulationPerformance: clamp(55 + simulationsCompletedEstimate * 9),
  };
  const adaptivePath = getAdaptivePath(adaptiveSignal);

  const questTitleMap: Array<{ match: RegExp; title: string; description: string }> = [
    { match: /lesson/i, title: td("quests.lessons.title"), description: td("quests.lessons.description") },
    { match: /quiz/i,   title: td("quests.quiz.title"),    description: td("quests.quiz.description") },
    { match: /mission|submit/i, title: td("quests.mission.title"), description: td("quests.mission.description") },
    { match: /streak/i, title: td("quests.streak.title"), description: td("quests.streak.description") },
  ];

  const questTemplates = weeklyQuestRows.length > 0
    ? weeklyQuestRows.map((quest) => {
        const i18n = questTitleMap.find((entry) => entry.match.test(quest.title));
        return {
          id: quest.id,
          title: i18n?.title ?? quest.title,
          description: i18n?.description ?? quest.description,
          goal: quest.goal,
          progress: 0,
          rewardXp: quest.rewardXp,
        };
      })
    : [
        {
          id: "quest-lessons",
          title: td("quests.lessons.title"),
          description: td("quests.lessons.description"),
          goal: 3,
          progress: 0,
          rewardXp: 90,
        },
        {
          id: "quest-quiz",
          title: td("quests.quiz.title"),
          description: td("quests.quiz.description"),
          goal: 1,
          progress: 0,
          rewardXp: 120,
        },
        {
          id: "quest-simulation",
          title: td("quests.mission.title"),
          description: td("quests.mission.description"),
          goal: 1,
          progress: 0,
          rewardXp: 160,
        },
        {
          id: "quest-streak",
          title: td("quests.streak.title"),
          description: td("quests.streak.description"),
          goal: 5,
          progress: 0,
          rewardXp: 140,
        },
      ];

  const weeklyQuests: WeeklyQuest[] = questTemplates.map((quest) => {
    if (quest.id === "quest-lessons") {
      return {
        ...quest,
        progress: Math.min(quest.goal, Math.max(quest.progress, Math.floor(completedLessons / 8))),
      };
    }
    if (quest.id === "quest-quiz") {
      return {
        ...quest,
        progress: Math.min(quest.goal, passedQuizzes > 0 ? 1 : 0),
      };
    }
    if (quest.id === "quest-simulation") {
      return {
        ...quest,
        progress: Math.min(quest.goal, simulationsCompletedEstimate > 0 ? 1 : 0),
      };
    }
    return {
      ...quest,
      progress: Math.min(quest.goal, Math.max(quest.progress, streak)),
    };
  }).map((quest) => {
    const status: WeeklyQuest["status"] =
      quest.progress >= quest.goal ? "completed" : quest.progress > 0 ? "in_progress" : "not_started";

    return {
      ...quest,
      status,
    };
  });

  const runtimeMappedMissions = mapRuntimeCatalogToMissions(runtimeCatalog);
  const dbMappedMissions: LearningMission[] = missionRows.map((mission) => {
    const category = mapPostingTrack(mission.category);
    const score = mission.submissions[0]?.score ?? 0;
    const status: LearningMission["status"] = mission.submissions.length === 0
      ? "available"
      : score >= 70
        ? "completed"
        : "in_progress";
    const difficulty: LearningMission["difficulty"] =
      mission.difficulty === "HARD" ? "Hard" : mission.difficulty === "EASY" ? "Easy" : "Medium";

    return {
      id: mission.id,
      title: mission.title,
      scenario: mission.scenario,
      roleContext: mission.roleContext,
      objective: mission.objective,
      steps: parseStringArray(mission.steps),
      skillsUsed: defaultSkillsByTrackTag(category),
      expectedResult: mission.expectedResult || "Закройте цель готовым артефактом продакшн-уровня.",
      difficulty,
      xpReward: mission.xpReward,
      aiEvaluation: mission.aiEvaluationEnabled,
      category,
      status,
    };
  });
  const allRuntimeMissions: LearningMission[] = Array.from(
    new Map([...runtimeMappedMissions, ...dbMappedMissions].map((mission) => [mission.id, mission])).values(),
  );

  const missionPreview = [
    ...allRuntimeMissions.filter((mission) => mission.category === onboardingProfile.profession),
    ...allRuntimeMissions.filter((mission) => mission.category !== onboardingProfile.profession),
  ]
    .slice(0, hasUnlimitedMissions ? 3 : 2)
    .map((mission) => ({
      id: mission.id,
      title: mission.title,
      scenario: mission.scenario,
      xpReward: mission.xpReward,
      status: mission.status,
    }));

  const planPreview = activeLearningPlan
    ? {
        goal: activeLearningPlan.goal,
        workload: activeLearningPlan.workload,
        forecastDate: activeLearningPlan.forecastDate?.toISOString() ?? buildDefaultPlanPreview(onboardingProfile.goal, onboardingProfile.hoursPerWeek).forecastDate,
      }
    : buildDefaultPlanPreview(onboardingProfile.goal, onboardingProfile.hoursPerWeek);
  const missionXp = missionXpSummary(allRuntimeMissions);

  const skillTags = skillRadar.data
    .filter((item) => item.value >= 62)
    .map((item) => item.skill);
  const runtimeJobPostings = jobPostingRows.map((job) => ({
    id: job.id,
    title: job.title,
    level: mapJobLevel(job.level),
    location: job.location,
    requiredSkills: parseStringArray(job.requiredSkills),
    description: job.responsibilities && Array.isArray(job.responsibilities)
      ? parseStringArray(job.responsibilities).join("; ")
      : `Role at ${job.company}`,
    roleTrack: mapPostingTrack(job.role?.track),
  }));
  const jobMatchingPreview = buildJobMatches({
    jobs: runtimeJobPostings,
    userSkills: [...onboardingProfile.interests, ...skillTags],
    preferredTrack: onboardingProfile.profession,
  })
    .slice(0, 3)
    .map((job) => ({
      id: job.id,
      title: job.title,
      matchPercent: job.matchPercent,
      missingRequirements: job.missingRequirements,
    }));

  const seenQuizQuestionIds = new Set<string>();
  let mistakeCount = 0;
  for (const row of quizReviewRows) {
    if (seenQuizQuestionIds.has(row.questionId)) {
      continue;
    }
    seenQuizQuestionIds.add(row.questionId);
    if (!row.isCorrect) {
      mistakeCount += 1;
    }
  }

  const reviewPreview = {
    bookmarkCount: bookmarkCount,
    noteCount: noteCount,
    mistakeCount: mistakeCount,
  };

  const now = new Date();
  const ta = await getTranslations("dashboard.data.activity");
  const activity: DashboardActivityItem[] = [
    ...user.progresses
      .filter((progress) => progress.status === ProgressStatus.COMPLETED && progress.completedAt)
      .slice(0, 4)
      .flatMap((progress) => {
        const completion: DashboardActivityItem = {
          id: `lesson-${progress.id}`,
          title: ta("completedModule", { title: progress.module.title }),
          description: ta("completedModuleSub", { track: progress.module.track.title }),
          kind: "lesson",
          timestamp: progress.completedAt as Date,
        };
        const quiz = (progress.score ?? 0) >= 70
          ? {
              id: `quiz-${progress.id}`,
              title: ta("passedQuiz", { title: progress.module.title }),
              description: ta("passedQuizScore", { score: progress.score ?? 0 }),
              kind: "quiz" as const,
              timestamp: progress.completedAt as Date,
            }
          : null;
        return quiz ? [completion, quiz] : [completion];
      }),
    ...user.certificates.map((certificate) => ({
      id: `certificate-${certificate.id}`,
      title: ta("certificateEarned"),
      description: ta("certificateCompleted", { track: certificate.track.title }),
      kind: "certificate" as const,
      timestamp: certificate.issuedAt,
    })),
    ...user.courseCertificates.map((certificate) => ({
      id: `course-certificate-${certificate.id}`,
      title: ta("certificateEarned"),
      description: ta("certificateCompleted", { track: certificate.course.title }),
      kind: "certificate" as const,
      timestamp: certificate.issuedAt,
    })),
    ...(skillTree.unlockedCount > 0
      ? [
          {
            id: "skill-unlock",
            title: ta("skillUnlockTitle"),
            description: ta("skillUnlockSub", { unlocked: skillTree.unlockedCount, total: skillTree.totalCount }),
            kind: "skill" as const,
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          },
        ]
      : []),
    ...(badges.length > 0
      ? [
          {
            id: "badge-earned",
            title: ta("badgeEarned"),
            description: badges[badges.length - 1],
            kind: "badge" as const,
            timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          },
        ]
      : []),
    ...(simulationsCompletedEstimate > 0
      ? [
          {
            id: "simulation-complete",
            title: ta("simulationTitle"),
            description: ta("simulationSub", { count: simulationsCompletedEstimate }),
            kind: "simulation" as const,
            timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
          },
        ]
      : []),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  const artifactActivity = activity.filter(
    (item) => item.kind === "lesson" || item.kind === "quiz" || item.kind === "simulation",
  );
  const portfolioPreview = {
    totalEntries: artifactActivity.length + certificateCount,
    missionArtifacts: missionPreview.length,
    recentEntryTitle: artifactActivity[0]?.title ?? null,
  };

  const upcomingActions: DashboardUpcomingAction[] = [
    {
      id: "continue-module",
      title: td("actions.continueModule"),
      description: primaryTrack?.nextModuleTitle
        ? `${primaryTrack.title}: ${primaryTrack.nextModuleTitle}`
        : td("actions.continueModuleFallback"),
      href: primaryTrack?.nextModuleHref ?? "/tracks",
      priority: "High",
      difficulty: "High",
      xpReward: 120,
      skillImpact: primaryTrack?.category === TrackCategory.BA ? td("actions.impactBA") : primaryTrack?.category === TrackCategory.DA ? td("actions.impactDA") : td("actions.impactQA"),
      eta: "15-25 min",
    },
    {
      id: "redo-quiz",
      title: lowScoreProgress ? td("actions.redoQuiz") : td("actions.takeNextQuiz"),
      description: lowScoreProgress
        ? td("actions.redoQuizDescription", { module: lowScoreProgress.moduleTitle, score: lowScoreProgress.score })
        : td("actions.takeNextQuizFallback"),
      href: lowScoreProgress
        ? `/tracks/${lowScoreProgress.trackSlug}/modules/${lowScoreProgress.moduleId}/quiz`
        : primaryTrack?.nextModuleHref
          ? `${primaryTrack.nextModuleHref}/quiz`
          : "/tracks",
      priority: "High",
      difficulty: "Medium",
      xpReward: 80,
      skillImpact: td("actions.impactRetention"),
      eta: "10-15 min",
    },
    {
      id: "simulation",
      title: td("actions.simulation"),
      description: td("actions.simulationDescription"),
      href:
        strongestCategory === TrackCategory.BA
          ? "/simulation/ba"
          : strongestCategory === TrackCategory.DA
            ? "/sandbox/sql"
          : "/simulation/bug-tracker",
      priority: "Medium",
      difficulty: "High",
      xpReward: 140,
      skillImpact: td("actions.simulationImpact"),
      eta: "20-40 min",
    },
    {
      id: "skill-unlock",
      title: td("actions.skillUnlock"),
      description: skillTree.nextUnlock
        ? td("actions.skillUnlockDescription", { target: skillTree.nextUnlock })
        : td("actions.skillUnlockFallback"),
      href: "/career",
      priority: "Medium",
      difficulty: "Medium",
      xpReward: 60,
      skillImpact: skillTree.nextUnlock ?? td("actions.skillUnlockImpactFallback"),
      eta: "20 min",
    },
    {
      id: "interview",
      title: td("actions.interview"),
      description: td("actions.interviewDescription"),
      href: "/interview",
      priority: "Low",
      difficulty: "Low",
      xpReward: 50,
      skillImpact: td("actions.interviewImpact"),
      eta: "15-20 min",
    },
  ];

  const todayKey = formatDateKey(new Date());
  const completedTodayModules = completedDates.filter((date) => formatDateKey(date) === todayKey).length;
  const dailyGoal = {
    targetLessons: 2,
    completedLessons: Math.min(2, completedTodayModules * 3),
    targetXp: 150,
    earnedXp: Math.min(150, completedTodayModules * 70),
  };

  const achievements: DashboardAchievement[] = [
    {
      id: "modules",
      label: td("achievements.modulesCompleted"),
      value: String(completedModules),
      hint: td("achievements.modulesHint", { total: totalModules }),
    },
    {
      id: "passed-quizzes",
      label: td("achievements.quizzesPassed"),
      value: String(passedQuizzes),
      hint: td("achievements.quizzesHint"),
    },
    {
      id: "certificates",
      label: td("achievements.certificates"),
      value: String(certificateCount),
      hint: td("achievements.certificatesHint"),
    },
    {
      id: "best-score",
      label: td("achievements.bestScore"),
      value: bestScore ? `${bestScore}%` : "N/A",
      hint: td("achievements.bestScoreHint"),
    },
    {
      id: "missions-xp",
      label: td("achievements.missionXp"),
      value: String(missionXp.earned),
      hint: td("achievements.missionXpHint", { total: missionXp.total }),
    },
  ];

  const hasFullTrackAccess = checkFeatureAccess(subscriptionState, "tracks.full").allowed;
  const visibleTracks = [...trackSummaries]
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, hasFullTrackAccess ? 3 : 1);

  const strongestSkills = [...skillRadar.data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((item) => item.skill);
  const weakestSkills = [...skillRadar.data]
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((item) => item.skill);

  const missionSuccessRate = Math.round(
    (weeklyQuests.filter((item) => item.status === "completed").length / Math.max(weeklyQuests.length, 1)) * 100,
  );
  const saasAnalytics = buildAdvancedLearningAnalytics({
    weeklyProgress,
    skillRadar: skillRadar.data,
    heatmap: heatmap.data,
    quizAccuracy,
    missionSuccessRate,
  });

  const saasAchievements = buildSaasAchievements({
    completedModules,
    missionSubmissions: missionPreview.length,
    strongestSkills,
    totalXp: xpBreakdown.totalXp,
    streakDays: streak,
  });
  // ─────────────────────────────────────────────────────────────────
  // SAAS GAMIFICATION
  // ─────────────────────────────────────────────────────────────────
  const saasBadges = toSaasBadges(saasAchievements);

  // Dynamic Gamification Models (Phase 3)
  const userStreakEntry = user.userStreak || {
    currentStreak: streak || 0,
    longestStreak: Math.max(streak, 0),
    streakFreezes: 0,
    lastActivityDate: new Date()
  };
  
  const dailyChallengeEntry = user.dailyChallenges.length > 0
    ? user.dailyChallenges[0]
    : {
        challengeType: "COMPLETE_LESSON",
        goal: 3,
        progress: weeklyCompleted,
        isCompleted: weeklyCompleted >= 3,
        xpReward: 100
      };

  const streakMeta = {
    currentStreak: userStreakEntry.currentStreak,
    longestStreak: userStreakEntry.longestStreak,
    streakFreezes: userStreakEntry.streakFreezes,
    isActiveToday: userStreakEntry.lastActivityDate ? new Date(userStreakEntry.lastActivityDate).toDateString() === new Date().toDateString() : false,
  };

  const formattedDailyChallenge = {
    challengeType: dailyChallengeEntry.challengeType,
    title: dailyChallengeEntry.challengeType === "COMPLETE_LESSON" ? "Complete 3 lessons today" : "Daily Challenge",
    goal: dailyChallengeEntry.goal,
    progress: dailyChallengeEntry.progress,
    isCompleted: dailyChallengeEntry.progress >= dailyChallengeEntry.goal || dailyChallengeEntry.isCompleted,
    xpReward: dailyChallengeEntry.xpReward,
  };
  const streaks = buildStreakSummary(heatmap.data);

  const smartRecommendations = buildSmartRecommendations({
    careerTarget: onboardingProfile.goal,
    learningProgressPercent: overallProgress,
    skillGaps: career.missingSkills,
    weakestSkills,
    upcomingModules: upcomingActions.slice(0, 2).map((item) => ({
      title: item.title,
      href: item.href,
    })),
    missionSuggestions: missionPreview.slice(0, 2).map((item) => ({
      title: item.title,
      href: "/missions",
    })),
  });

  const profileHandle = toPublicHandle(user.name, user.id);
  const publicProfile = buildPublicProfileSnapshot({
    handle: profileHandle,
    name: user.name,
    headline: `${onboardingProfile.goal} | ${role === "ADMIN" ? "Admin mentor" : "Learner"}`,
    skillRadar: skillRadar.data,
    badges: saasBadges,
    missionOutcomes: missionPreview.map((item, index) => ({
      title: item.title,
      score: clamp(68 + index * 8 + Math.round(quizAccuracy / 12), 0, 100),
    })),
    portfolioHighlights: [
      portfolioPreview.recentEntryTitle ?? "No recent entries yet",
      `${portfolioPreview.missionArtifacts} mission artifacts`,
      `${portfolioPreview.totalEntries} total portfolio entries`,
    ],
    readinessScore: 40 + Math.round((career.progressToNextStage + quizAccuracy) / 4),
  });

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const growthCards = buildGrowthShareCards({
    origin: appOrigin,
    profileHandle,
    recentAchievement: saasBadges[0]?.label ?? null,
    leaderboardRank: leaderboard.currentUserRank,
  });

  const twr = await getTranslations("dashboard.data.weeklyReport");
  const skillGrowthPercent = saasAnalytics.learningVelocity[saasAnalytics.learningVelocity.length - 1]?.value ?? 0;
  const normalizedGrowth = Math.max(0, Math.min(100, skillGrowthPercent));
  const reportStrongest = strongestSkills[0] ?? skillRadar.strongestSkill;
  const reportMissions = missionPreview.length;
  const weeklyAiReport = {
    headline: twr("headline"),
    summary: twr("summary", { skill: reportStrongest, growth: normalizedGrowth, missions: reportMissions }),
    highlights: [
      twr("highlightReadiness", { score: Math.max(0, Math.min(100, publicProfile.readinessScore)) }),
      twr("highlightStrongest", { skill: reportStrongest }),
      twr("highlightMissions", { missions: reportMissions }),
    ],
    nextFocus: skillRadar.nextFocus,
  };

  const marketplaceRoles = await listMarketplaceRoles();
  const jobMarketplaceMatches = buildSaasJobMatches({
    roles: marketplaceRoles,
    userSkills: [...onboardingProfile.interests, ...skillRadar.data.map((item) => item.skill)],
    portfolioSkills: [...onboardingProfile.interests, ...(portfolioPreview.recentEntryTitle ? [skillRadar.strongestSkill] : [])],
    missionOutcomes: missionPreview.map((item, index) => ({
      title: item.title,
      score: clamp(70 + index * 6 + Math.round(quizAccuracy / 10), 0, 100),
      skills: skillRadar.data.slice(index, index + 3).map((entry) => entry.skill),
    })),
    readinessScore: publicProfile.readinessScore,
  });

  const tn = await getTranslations("dashboard.data.notifications");
  const completedQuestCount = weeklyQuests.filter((item) => item.status === "completed").length;
  const notifications = buildDashboardNotifications({
    unlockedMissionTitle: missionPreview[0]?.title ?? null,
    weeklySummaryText: tn("summaryBody", { completed: completedQuestCount, xp: earnedXpThisWeek }),
    recommendationTitle: smartRecommendations[0]?.title ?? null,
    topJobTitle: jobMarketplaceMatches[0]?.title ?? null,
    achievementTitle: saasBadges[0]?.label ?? null,
    labels: {
      missionTitle: tn("missionTitle"),
      summaryTitle: tn("summaryTitle"),
      recommendationTitle: tn("recommendationTitle"),
      jobTitle: tn("jobTitle"),
      achievementTitle: tn("achievementTitle"),
    },
  });

  const strongestSkillPool = ["API Testing", "User Stories", "SQL", "Automation", "Communication"];
  const teamMembers: TeamMemberProgress[] = leaderboardUsers.slice(0, 8).map((member, index) => {
    const memberCompleted = member.progresses.filter((progress) => progress.status === ProgressStatus.COMPLETED).length;
    const memberTotal = Math.max(member.progresses.length, 1);
    const memberScoreList = member.progresses
      .map((progress) => progress.score)
      .filter((score): score is number => typeof score === "number");
    const averageMemberScore = memberScoreList.length > 0
      ? Math.round(memberScoreList.reduce((sum, score) => sum + score, 0) / memberScoreList.length)
      : quizAccuracy;
    const email = member.email.toLowerCase();
    const assignedTrack =
      email.includes("ba")
        ? "Business Analyst"
        : email.includes("da") || email.includes("data")
          ? "Data Analyst"
          : "QA Engineer";

    return {
      userId: member.id,
      name: member.name ?? "Levio User",
      role: index === 0 && role === "ADMIN" ? "MANAGER" : "LEARNER",
      assignedTrack,
      progressPercent: Math.round((memberCompleted / memberTotal) * 100),
      velocity: clamp(memberCompleted * 4 + Math.round(averageMemberScore / 8), 5, 35),
      strongestSkill: strongestSkillPool[index % strongestSkillPool.length],
    };
  });

  const teamLearning = subscriptionGates.teamDashboard.allowed && teamMembers.length > 0
    ? buildTeamAnalytics({
        teamId: "team-default",
        teamName: "Levio Team Workspace",
        members: teamMembers,
      })
    : null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      isDemoUser: !preferredEmail || preferredEmail !== user.email,
    },
    hero: {
      overallProgress,
      completedModules,
      totalModules,
      primaryTrackTitle: primaryTrack?.title ?? "Learning journey",
      primaryTrackProgress: primaryTrack?.progressPercent ?? 0,
      totalXp: xpBreakdown.totalXp,
      learningStreakDays: streak,
      overallSkillLevel: overallSkillLevelFromRadar(skillRadar),
      trackCompletionEstimate: primaryTrack?.estimatedCompletion ?? "n/a",
      level: getLevelByXp(xpBreakdown.totalXp),
      continueHref: primaryTrack?.nextModuleHref ?? "/tracks",
      roadmapHref: "/career",
      mentorHref: primaryTrack?.nextModuleHref ?? "/tracks",
    },
    stats: [
      {
        id: "completed-lessons",
        label: td("stats.completedLessons"),
        value: String(completedLessons),
        helper: td("stats.completedLessonsHelper", { count: completedModules }),
      },
      {
        id: "active-tracks",
        label: td("stats.activeTracks"),
        value: String(activeTrackCount),
        helper: td("stats.activeTracksHelper", { count: trackSummaries.length }),
      },
      {
        id: "total-xp",
        label: td("stats.totalXp"),
        value: `${xpBreakdown.totalXp}`,
        helper: td("stats.totalXpHelper", { xp: earnedXpThisWeek }),
      },
      {
        id: "quiz-accuracy",
        label: td("stats.quizAccuracy"),
        value: `${quizAccuracy}%`,
        helper: td("stats.quizAccuracyHelper", { count: passedQuizzes }),
      },
      {
        id: "weekly-streak",
        label: td("stats.streak"),
        value: td("stats.streakValue", { days: streak }),
        helper: td("stats.streakHelper"),
      },
      {
        id: "simulations",
        label: td("stats.simulations"),
        value: String(simulationsCompletedEstimate),
        helper: td("stats.simulationsHelper"),
      },
    ],
    tracks: visibleTracks.map((track) => ({
        id: track.id,
        slug: track.slug,
        title: track.title,
        description: track.description,
        category: track.category,
        progressPercent: track.progressPercent,
        completedModules: track.completedModules,
        totalModules: track.totalModules,
        inProgressModules: track.inProgressModules,
        averageScore: track.averageScore,
        nextModuleTitle: track.nextModuleTitle,
        nextModuleHref: track.nextModuleHref,
        estimatedCompletion: track.estimatedCompletion,
        skillsGained: getTrackSkills(
          track.category,
          'skills' in track ? (track as Record<string, unknown>).skills as string[] : undefined,
        ),
        careerImpact: getTrackCareerImpact(
          track.category,
          'careerImpact' in track ? (track as Record<string, unknown>).careerImpact as string | undefined : undefined,
        ),
        modulePreview: hasFullTrackAccess ? track.modulePreview : track.modulePreview.slice(0, 2),
      })),
    activeTrackCount,
    skillRadar,
    xp: {
      totalXp: xpBreakdown.totalXp,
      currentLevel: levelProgress.currentLevel,
      nextLevel: levelProgress.nextLevel,
      progressPercent: levelProgress.progressPercent,
      xpNeededForNext: levelProgress.xpNeededForNext,
      streak,
      badgesCount: badges.length,
      badges,
      weeklyXp: earnedXpThisWeek,
    },
    heatmap,
    skillTree,
    recommendations,
    leaderboard,
    activity,
    career,
    upcomingActions,
    achievements,
    adaptiveSuggestions: adaptivePath.suggestions,
    weeklyQuests,
    missionPreview,
    plannerPreview: {
      goal: planPreview.goal,
      workload: planPreview.workload,
      forecastDate: planPreview.forecastDate,
    },
    jobMatchingPreview,
    reviewPreview,
    portfolioPreview,
    weeklyProgress,
    dailyGoal,
    subscription: {
      state: subscriptionState,
      plan: subscriptionPlan,
      usage: subscriptionUsage,
      gates: subscriptionGates,
    },
    saasAnalytics,
    saasGamification: {
      achievements: saasAchievements,
      badges: saasBadges,
      streakMeta,
      dailyChallenge: formattedDailyChallenge,
    },
    streaks,
    smartRecommendations,
    notifications,
    weeklyAiReport,
    growth: {
      publicProfileUrl: `${appOrigin}/profile/${profileHandle}`,
      cards: growthCards,
    },
    publicProfile,
    jobMarketplace: {
      topMatches: jobMarketplaceMatches.slice(0, 4),
    },
    teamLearning,
    sectionNav,
  };
}
