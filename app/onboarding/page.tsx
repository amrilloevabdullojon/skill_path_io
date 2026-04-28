import type { Metadata } from "next";

import { SmartOnboardingFlow } from "@/components/onboarding/smart-onboarding-flow";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";

export const metadata: Metadata = {
  title: "Добро пожаловать — Levio",
  description: "Расскажите нам о ваших целях, и ИИ соберет для вас индивидуальный путь обучения.",
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
