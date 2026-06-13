import { NextResponse } from "next/server";

import { Errors, apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { getOnboardingProfileFromCookie, ONBOARDING_COOKIE_KEY } from "@/lib/personalization/profile-storage";
import { OnboardingProfile } from "@/types/personalization";

function normalizeProfession(value: unknown, fallback: OnboardingProfile["profession"]) {
  if (value === "QA" || value === "BA" || value === "DA") return value;
  return fallback;
}

function normalizeLevel(value: unknown, fallback: OnboardingProfile["currentLevel"]) {
  if (value === "BEGINNER" || value === "FOUNDATION" || value === "INTERMEDIATE" || value === "ADVANCED") {
    return value;
  }
  return fallback;
}

export const GET = withErrorHandler(async () => {
  const profile = await getOnboardingProfileFromCookie();
  return apiOk({ profile });
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = (await request.json()) as Partial<OnboardingProfile>;
  if (!body || typeof body !== "object") throw Errors.validation("Invalid onboarding payload");

  const fallback = await getOnboardingProfileFromCookie();

  const profile: OnboardingProfile = {
    ...fallback,
    ...body,
    profession: normalizeProfession(body.profession, fallback.profession),
    currentLevel: normalizeLevel(body.currentLevel, fallback.currentLevel),
    goal: typeof body.goal === "string" && body.goal.trim() ? body.goal.trim().slice(0, 240) : fallback.goal,
    updatedAt: new Date().toISOString(),
    interests: Array.isArray(body.interests)
      ? body.interests.filter((item): item is string => typeof item === "string")
      : [],
    hoursPerWeek:
      typeof body.hoursPerWeek === "number"
        ? Math.max(1, Math.min(30, body.hoursPerWeek))
        : fallback.hoursPerWeek,
    targetMonths:
      typeof body.targetMonths === "number"
        ? Math.max(1, Math.min(24, body.targetMonths))
        : fallback.targetMonths,
  };

  const response = NextResponse.json({ ok: true, profile });
  response.cookies.set(ONBOARDING_COOKIE_KEY, JSON.stringify(profile), {
    // httpOnly: true prevents client-side JS from reading this cookie,
    // mitigating XSS-based session data theft. The profile is read via the
    // GET /api/onboarding/profile endpoint, not directly from the cookie.
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
});
