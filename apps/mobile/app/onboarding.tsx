import { Redirect, useRouter } from "expo-router";

import { useAuth } from "~/auth";
import { OnboardingScreen } from "~/screens/OnboardingScreen";

export default function OnboardingRoute() {
  const router = useRouter();
  const { status } = useAuth();
  if (status === "unauthenticated") return <Redirect href="/login" />;
  return <OnboardingScreen onComplete={() => router.replace("/tracks")} />;
}
