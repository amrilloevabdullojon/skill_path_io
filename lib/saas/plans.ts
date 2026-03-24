import { FeatureKey, SubscriptionPlan, SubscriptionPlanId, UsageLimit } from "@/types/saas";

const unlimited = Number.POSITIVE_INFINITY;

function withLimit(meter: UsageLimit["meter"], limit: number | null, window: UsageLimit["window"]): UsageLimit {
  return { meter, limit, window };
}

function featureBundle(features: FeatureKey[], limits: UsageLimit[]) {
  return {
    features,
    limits,
  };
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "FREE",
    name: "Free",
    description: "Core dashboard and limited practice to start your path.",
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    featureBundle: featureBundle(
      [
        "dashboard.access",
        "tracks.limited",
        "missions.limited",
        "community.discussions",
        "notifications.center",
        "profile.public",
      ],
      [
        withLimit("aiMentorRequests", 20, "MONTHLY"),
        withLimit("missionSubmissions", 12, "MONTHLY"),
        withLimit("interviewSessions", 0, "MONTHLY"),
        withLimit("jobApplications", 3, "MONTHLY"),
        withLimit("profileShares", 10, "MONTHLY"),
      ],
    ),
  },
  {
    id: "PRO",
    name: "Pro",
    description: "Full learning tracks with AI mentor and skill analytics.",
    monthlyPriceUsd: 29,
    annualPriceUsd: 290,
    featureBundle: featureBundle(
      [
        "dashboard.access",
        "tracks.full",
        "missions.unlimited",
        "ai.mentor",
        "skill.radar",
        "portfolio.builder",
        "analytics.advanced",
        "community.discussions",
        "community.peer_feedback",
        "growth.sharing",
        "profile.public",
        "notifications.center",
        "ai.weekly_report",
      ],
      [
        withLimit("aiMentorRequests", 400, "MONTHLY"),
        withLimit("missionSubmissions", null, "MONTHLY"),
        withLimit("interviewSessions", 8, "MONTHLY"),
        withLimit("jobApplications", 25, "MONTHLY"),
        withLimit("profileShares", 200, "MONTHLY"),
      ],
    ),
  },
  {
    id: "CAREER_ACCELERATOR",
    name: "Career Accelerator",
    description: "Interview mode, readiness analytics, and hiring marketplace access.",
    monthlyPriceUsd: 59,
    annualPriceUsd: 590,
    featureBundle: featureBundle(
      [
        "dashboard.access",
        "tracks.full",
        "missions.unlimited",
        "ai.mentor",
        "skill.radar",
        "portfolio.builder",
        "analytics.advanced",
        "interview.mode",
        "readiness.analytics",
        "hiring.marketplace",
        "community.discussions",
        "community.peer_feedback",
        "growth.sharing",
        "profile.public",
        "notifications.center",
        "ai.weekly_report",
      ],
      [
        withLimit("aiMentorRequests", 1200, "MONTHLY"),
        withLimit("missionSubmissions", null, "MONTHLY"),
        withLimit("interviewSessions", null, "MONTHLY"),
        withLimit("jobApplications", null, "MONTHLY"),
        withLimit("profileShares", null, "MONTHLY"),
      ],
    ),
  },
  {
    id: "TEAM",
    name: "Team",
    description: "Company plan with team dashboards, analytics, and admin controls.",
    monthlyPriceUsd: 199,
    annualPriceUsd: 1990,
    featureBundle: featureBundle(
      [
        "dashboard.access",
        "tracks.full",
        "missions.unlimited",
        "ai.mentor",
        "skill.radar",
        "portfolio.builder",
        "analytics.advanced",
        "interview.mode",
        "readiness.analytics",
        "hiring.marketplace",
        "teams.dashboard",
        "teams.analytics",
        "teams.admin",
        "community.discussions",
        "community.peer_feedback",
        "growth.sharing",
        "profile.public",
        "notifications.center",
        "ai.weekly_report",
      ],
      [
        withLimit("aiMentorRequests", unlimited, "MONTHLY"),
        withLimit("missionSubmissions", null, "MONTHLY"),
        withLimit("interviewSessions", null, "MONTHLY"),
        withLimit("jobApplications", null, "MONTHLY"),
        withLimit("profileShares", null, "MONTHLY"),
      ],
    ),
  },
];

export function getPlanById(planId: SubscriptionPlanId) {
  return subscriptionPlans.find((plan) => plan.id === planId) ?? subscriptionPlans[0];
}
