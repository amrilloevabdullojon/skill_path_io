import { getServerSession } from "next-auth";

import { MissionBoard } from "@/components/missions/mission-board";
import { authOptions } from "@/lib/auth";
import { resolveLearningUser } from "@/lib/learning-user";
import { resolveRuntimeMissions } from "@/lib/missions/runtime-missions";
import { getOnboardingProfileFromCookie } from "@/lib/personalization/profile-storage";
import { checkFeatureAccess } from "@/lib/saas/gating";
import { resolveUserSubscription } from "@/lib/saas/subscriptions";

export default async function MissionsPage() {
  const session = await getServerSession(authOptions);
  const profile = getOnboardingProfileFromCookie();
  const runtimeMissions = await resolveRuntimeMissions();
  const user = await resolveLearningUser(session?.user?.email);
  const subscription = await resolveUserSubscription({
    userId: user?.id ?? `anon-${session?.user?.email ?? "student"}`,
    userEmail: user?.email ?? session?.user?.email ?? "student@skillpath.local",
    role: session?.user?.role ?? "STUDENT",
  });

  const missions = [
    ...runtimeMissions.filter((mission) => mission.category === profile.profession),
    ...runtimeMissions.filter((mission) => mission.category !== profile.profession),
  ];
  const missionsUnlimited = checkFeatureAccess(subscription, "missions.unlimited").allowed;
  const visibleMissions = missionsUnlimited ? missions : missions.slice(0, 2);

  return (
    <section className="page-shell">
      <MissionBoard
        missions={visibleMissions}
        isPlanLimited={!missionsUnlimited}
        upgradeMessage={!missionsUnlimited ? "Free plan has mission limits. Upgrade to Pro for unlimited missions." : null}
      />
    </section>
  );
}
