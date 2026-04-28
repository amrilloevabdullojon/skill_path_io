import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { TeamLearningHub } from "@/components/saas/team-learning-hub";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Обучение Команды — Levio",
  description: "Управляйте обучением команды, отслеживайте прогресс и координируйте тренировки (B2B).",
  robots: { index: false },
};
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
      <section className="page-shell relative isolate overflow-hidden p-6 sm:p-12 border border-border/50 bg-card/40 backdrop-blur-md rounded-[24px]">
        <EmptyState
          title="Данные команды недоступны"
          description="Откройте дашборд после загрузки данных пользователей."
          actionLabel="Панель управления"
          actionHref="/dashboard"
        />
      </section>
    );
  }

  return (
    <section className="page-shell relative isolate overflow-hidden">
      {/* Background Neon Orbs for Teams Page */}
      <div className="absolute top-[0%] left-[10%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none -z-10" />

      <TeamLearningHub
        team={dashboard.teamLearning}
        isLocked={!dashboard.subscription.gates.teamDashboard.allowed}
        upgradePlanId={dashboard.subscription.gates.teamDashboard.upgradePlanId}
      />
    </section>
  );
}

