import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { SubscriptionBillingPanel } from "@/components/saas/subscription-billing-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Billing — SkillPath Academy",
  description: "Manage your subscription plan and billing details.",
  robots: { index: false },
};
import { getDashboardData } from "@/lib/dashboard/data";
import { listSubscriptionPlans } from "@/lib/saas/subscriptions";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const [dashboard, plans] = await Promise.all([
    getDashboardData({
      preferredEmail: session?.user?.email,
      sessionRole: session?.user?.role,
    }),
    listSubscriptionPlans(),
  ]);

  if (!dashboard) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Billing data unavailable"
          description="Open dashboard after user/content data is available."
          actionLabel="Open dashboard"
          actionHref="/dashboard"
        />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <SubscriptionBillingPanel
        currentPlanId={dashboard.subscription.state.planId}
        plans={plans}
        usage={dashboard.subscription.usage}
      />
    </section>
  );
}

