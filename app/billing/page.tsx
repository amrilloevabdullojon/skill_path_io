import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { SubscriptionBillingPanel } from "@/components/saas/subscription-billing-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Оплата и Подписка",
  description: "Управляйте своим тарифным планом и данными для биллинга.",
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
          title="Данные биллинга недоступны"
          description="Откройте дашборд после завершения онбординга, чтобы загрузить данные."
          actionLabel="Открыть дашборд"
          actionHref="/dashboard"
        />
      </section>
    );
  }

  return (
    <section className="page-shell relative isolate overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-[5%] -right-[5%] w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[140px] pointer-events-none -z-10" />
      <SubscriptionBillingPanel
        currentPlanId={dashboard.subscription.state.planId}
        plans={plans}
        usage={dashboard.subscription.usage}
      />
    </section>
  );
}

