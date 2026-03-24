import { getServerSession } from "next-auth";

import { TeamLearningHub } from "@/components/saas/team-learning-hub";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!dashboard) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Team data unavailable"
          description="Open dashboard after user/content data is available."
          actionLabel="Open dashboard"
          actionHref="/dashboard"
        />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <TeamLearningHub
        team={dashboard.teamLearning}
        isLocked={!dashboard.subscription.gates.teamDashboard.allowed}
        upgradePlanId={dashboard.subscription.gates.teamDashboard.upgradePlanId}
      />
    </section>
  );
}

