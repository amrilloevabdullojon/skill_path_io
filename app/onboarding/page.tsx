import type { Metadata } from "next";

import { SmartOnboardingFlow } from "@/components/onboarding/smart-onboarding-flow";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";

export const metadata: Metadata = {
  title: "Get Started — SkillPath Academy",
  description: "Tell us your goals and experience so we can build your personalized learning path.",
  robots: { index: false },
};

export default function OnboardingPage() {
  const profile = getOnboardingProfileFromCookie();

  return (
    <section className="page-shell">
      <SmartOnboardingFlow initialProfile={profile} />
    </section>
  );
}
