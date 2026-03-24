export type SubscriptionPlanId = "FREE" | "PRO" | "CAREER_ACCELERATOR" | "TEAM";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export type FeatureKey =
  | "dashboard.access"
  | "tracks.limited"
  | "tracks.full"
  | "missions.limited"
  | "missions.unlimited"
  | "ai.mentor"
  | "skill.radar"
  | "portfolio.builder"
  | "interview.mode"
  | "readiness.analytics"
  | "hiring.marketplace"
  | "teams.dashboard"
  | "teams.analytics"
  | "teams.admin"
  | "analytics.advanced"
  | "community.discussions"
  | "community.peer_feedback"
  | "growth.sharing"
  | "profile.public"
  | "notifications.center"
  | "ai.weekly_report";

export type UsageMeter =
  | "aiMentorRequests"
  | "missionSubmissions"
  | "interviewSessions"
  | "jobApplications"
  | "profileShares";

export type UsageWindow = "DAILY" | "WEEKLY" | "MONTHLY";

export type UsageLimit = {
  meter: UsageMeter;
  limit: number | null;
  window: UsageWindow;
};

export type PlanFeatureBundle = {
  features: FeatureKey[];
  limits: UsageLimit[];
};

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  featureBundle: PlanFeatureBundle;
};

export type SubscriptionState = {
  userId: string;
  userEmail: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  renewsAt: string | null;
  source: "mock-local";
};

export type FeatureGateResult = {
  allowed: boolean;
  reason: string;
  upgradePlanId?: SubscriptionPlanId;
};

export type UsageSnapshot = Record<UsageMeter, number>;

export type MeterUsageCheck = {
  meter: UsageMeter;
  used: number;
  limit: number | null;
  remaining: number | null;
  window: UsageWindow;
  reached: boolean;
};

export type AdvancedAnalyticsSeriesPoint = {
  label: string;
  value: number;
};

export type SkillGrowthPoint = {
  date: string;
  skill: string;
  score: number;
};

export type WeeklyConsistencyCell = {
  date: string;
  intensity: number;
};

export type AdvancedLearningAnalytics = {
  learningVelocity: AdvancedAnalyticsSeriesPoint[];
  missionSuccessRate: number;
  quizAccuracy: number;
  weeklyConsistency: {
    score: number;
    heatmap: WeeklyConsistencyCell[];
  };
  skillGrowth: {
    current: Array<{ skill: string; value: number }>;
    evolution: SkillGrowthPoint[];
  };
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type Badge = {
  id: string;
  label: string;
  tone: "sky" | "emerald" | "amber" | "violet";
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  xp: number;
  level: string;
  rank: number;
};

export type StreakSummary = {
  daily: number;
  weekly: number;
  heatmap: WeeklyConsistencyCell[];
};

export type CommunityDiscussion = {
  id: string;
  title: string;
  body: string;
  scope: "track" | "mission";
  scopeRef: string;
  author: string;
  replyCount: number;
  createdAt: string;
};

export type PeerFeedbackItem = {
  id: string;
  missionId: string;
  reviewer: string;
  summary: string;
  helpfulVotes: number;
};

export type TeamMemberProgress = {
  userId: string;
  name: string;
  role: "LEARNER" | "MANAGER";
  assignedTrack: string;
  progressPercent: number;
  velocity: number;
  strongestSkill: string;
};

export type TeamAnalyticsSnapshot = {
  teamId: string;
  teamName: string;
  members: TeamMemberProgress[];
  averageProgress: number;
  averageVelocity: number;
  skillDistribution: Array<{ skill: string; members: number }>;
};

export type MarketplaceRole = {
  id: string;
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
  minReadinessScore: number;
  status: "OPEN" | "PAUSED";
};

export type CandidateProfile = {
  userId: string;
  name: string;
  publicHandle: string;
  readinessScore: number;
  skills: string[];
  badges: string[];
  portfolioHighlights: string[];
};

export type RoleApplication = {
  id: string;
  roleId: string;
  candidateUserId: string;
  portfolioUrl: string;
  createdAt: string;
  status: "SUBMITTED" | "REVIEWING" | "SHORTLISTED";
};

export type JobMatch = {
  roleId: string;
  title: string;
  company: string;
  matchPercent: number;
  missingSkills: string[];
  evidenceSignals: string[];
};

export type SmartRecommendation = {
  id: string;
  title: string;
  description: string;
  href: string;
  reason: string;
  type: "module" | "mission" | "skill" | "interview";
};

export type GrowthShareCard = {
  id: string;
  title: string;
  description: string;
  shareUrl: string;
  channelHint: "linkedin" | "x" | "internal";
};

export type PublicProfileSnapshot = {
  handle: string;
  name: string;
  headline: string;
  skillRadar: Array<{ skill: string; value: number }>;
  badges: Badge[];
  missionOutcomes: Array<{ title: string; score: number }>;
  portfolioHighlights: string[];
  readinessScore: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: "mission" | "summary" | "recommendation" | "job" | "achievement";
  href: string;
  createdAt: string;
  isRead: boolean;
};

export type WeeklyAiReport = {
  headline: string;
  summary: string;
  highlights: string[];
  nextFocus: string;
};

export type ProductTourStep = {
  id: string;
  title: string;
  description: string;
  targetId: string;
};
