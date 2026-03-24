import { SmartOnboardingFlow } from "@/components/onboarding/smart-onboarding-flow";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";

export default function OnboardingPage() {
  const profile = getOnboardingProfileFromCookie();

  return (
    <section className="page-shell">
      <SmartOnboardingFlow initialProfile={profile} />
    </section>
  );
}
