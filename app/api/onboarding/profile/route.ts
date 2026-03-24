import { NextResponse } from "next/server";

import { getOnboardingProfileFromCookie, ONBOARDING_COOKIE_KEY } from "@/lib/personalization/profile-storage";
import { OnboardingProfile } from "@/types/personalization";

export async function GET() {
  const profile = getOnboardingProfileFromCookie();
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<OnboardingProfile>;
    const fallback = getOnboardingProfileFromCookie();

    const profile: OnboardingProfile = {
      ...fallback,
      ...body,
      updatedAt: new Date().toISOString(),
      interests: Array.isArray(body.interests) ? body.interests.filter((item): item is string => typeof item === "string") : [],
      hoursPerWeek: typeof body.hoursPerWeek === "number" ? Math.max(1, Math.min(30, body.hoursPerWeek)) : fallback.hoursPerWeek,
      targetMonths: typeof body.targetMonths === "number" ? Math.max(1, Math.min(24, body.targetMonths)) : fallback.targetMonths,
    };

    const response = NextResponse.json({ ok: true, profile });
    response.cookies.set(ONBOARDING_COOKIE_KEY, JSON.stringify(profile), {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid onboarding payload" }, { status: 400 });
  }
}
