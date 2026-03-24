import { cookies } from "next/headers";

import { OnboardingProfile } from "@/types/personalization";

export const ONBOARDING_COOKIE_KEY = "skillpath_onboarding_profile";

function buildDefaultOnboardingProfile(): OnboardingProfile {
  const now = new Date().toISOString();
  return {
    id: "onb-default",
    userId: "default-user",
    profession: "QA",
    currentLevel: "FOUNDATION",
    goal: "Become job-ready with consistent weekly practice",
    hoursPerWeek: 6,
    targetMonths: 3,
    interests: ["Testing", "API", "SQL"],
    createdAt: now,
    updatedAt: now,
  };
}

function isOnboardingProfile(value: unknown): value is OnboardingProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<OnboardingProfile>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.userId === "string" &&
    typeof candidate.profession === "string" &&
    typeof candidate.currentLevel === "string" &&
    typeof candidate.goal === "string" &&
    typeof candidate.hoursPerWeek === "number" &&
    typeof candidate.targetMonths === "number" &&
    Array.isArray(candidate.interests)
  );
}

export function getOnboardingProfileFromCookie(): OnboardingProfile {
  const raw = cookies().get(ONBOARDING_COOKIE_KEY)?.value;
  if (!raw) {
    return buildDefaultOnboardingProfile();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isOnboardingProfile(parsed)) {
      return parsed;
    }
  } catch {
    return buildDefaultOnboardingProfile();
  }

  return buildDefaultOnboardingProfile();
}
