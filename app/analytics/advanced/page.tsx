import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { AdvancedLearningAnalyticsDashboard } from "@/components/saas/advanced-learning-analytics-dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Расширенная Аналитика — Levio",
  description: "Детальная статистика: тренды завершения, пробелы в навыках и рыночные бенчмарки.",
  robots: { index: false },
};
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
          title="Отчеты недоступны"
          description="Откройте дашборд после загрузки ваших данных для формирования аналитики."
          actionLabel="Панель управления"
          actionHref="/dashboard"
        />
      </section>
    );
  }

  return (
    <section className="page-shell relative isolate overflow-hidden">
      {/* Background Neon Orbs for Analytics Page */}
      <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[140px] pointer-events-none -z-10" />

      <AdvancedLearningAnalyticsDashboard analytics={dashboard.saasAnalytics} />
    </section>
  );
}

