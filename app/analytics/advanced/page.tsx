import { getServerSession } from "next-auth";

import { AdvancedLearningAnalyticsDashboard } from "@/components/saas/advanced-learning-analytics-dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function AdvancedAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!dashboard) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Analytics unavailable"
          description="Open dashboard after user/content data is available."
          actionLabel="Open dashboard"
          actionHref="/dashboard"
        />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <AdvancedLearningAnalyticsDashboard analytics={dashboard.saasAnalytics} />
    </section>
  );
}

