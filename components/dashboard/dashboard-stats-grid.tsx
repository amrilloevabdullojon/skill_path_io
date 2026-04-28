import { Activity, BarChart3, Brain, CheckCircle2, Flame, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { DashboardStatCard } from "@/lib/dashboard/data";

type DashboardStatsGridProps = {
  stats: DashboardStatCard[];
};

export async function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const t = await getTranslations("dashboard.statsGrid");

  type CardConfig = {
    icon: React.ReactNode;
    color: string;
    label: string;
    helper: string;
  };

  function getCardConfig(id: DashboardStatCard["id"]): CardConfig {
    switch (id) {
      case "completed-lessons":
        return { icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />, color: "emerald", label: t("completedLessons.label"), helper: t("completedLessons.helper") };
      case "active-tracks":
        return { icon: <Activity className="h-5 w-5 text-indigo-400" />, color: "indigo", label: t("activeTracks.label"), helper: t("activeTracks.helper") };
      case "total-xp":
        return { icon: <Trophy className="h-5 w-5 text-amber-400" />, color: "amber", label: t("totalXp.label"), helper: t("totalXp.helper") };
      case "quiz-accuracy":
        return { icon: <Brain className="h-5 w-5 text-violet-400" />, color: "violet", label: t("quizAccuracy.label"), helper: t("quizAccuracy.helper") };
      case "weekly-streak":
        return { icon: <Flame className="h-5 w-5 text-orange-400" />, color: "orange", label: t("weeklyStreak.label"), helper: t("weeklyStreak.helper") };
      case "simulations":
        return { icon: <BarChart3 className="h-5 w-5 text-fuchsia-400" />, color: "fuchsia", label: t("simulations.label"), helper: t("simulations.helper") };
      default:
        return { icon: <BarChart3 className="h-5 w-5 text-slate-400" />, color: "slate", label: "—", helper: "—" };
    }
  }

  const primaryIds: DashboardStatCard["id"][] = ["total-xp", "active-tracks", "completed-lessons"];
  const learningIds: DashboardStatCard["id"][] = ["quiz-accuracy", "weekly-streak", "simulations"];

  const primaryStats = stats.filter((item) => primaryIds.includes(item.id));
  const learningStats = stats.filter((item) => learningIds.includes(item.id));

  const glowColors: Record<string, string> = {
    emerald:  "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
    indigo:   "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40",
    amber:    "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
    violet:   "bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40",
    orange:   "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40",
    fuchsia:  "bg-fuchsia-500/10 border-fuchsia-500/20 hover:border-fuchsia-500/40",
    slate:    "bg-slate-500/10 border-slate-500/20 hover:border-slate-500/40",
  };

  const glowBg: Record<string, string> = {
    emerald:  "bg-emerald-500/20",
    indigo:   "bg-indigo-500/20",
    amber:    "bg-amber-500/20",
    violet:   "bg-violet-500/20",
    orange:   "bg-orange-500/20",
    fuchsia:  "bg-fuchsia-500/20",
    slate:    "bg-slate-500/20",
  };

  const iconBg: Record<string, string> = {
    emerald:  "bg-emerald-500/10 border-emerald-500/20",
    indigo:   "bg-indigo-500/10 border-indigo-500/20",
    amber:    "bg-amber-500/10 border-amber-500/20",
    violet:   "bg-violet-500/10 border-violet-500/20",
    orange:   "bg-orange-500/10 border-orange-500/20",
    fuchsia:  "bg-fuchsia-500/10 border-fuchsia-500/20",
    slate:    "bg-slate-500/10 border-slate-500/20",
  };

  const renderCard = (stat: DashboardStatCard) => {
    const config = getCardConfig(stat.id);
    return (
      <article
        key={stat.id}
        className={`relative overflow-hidden surface-elevated border bg-card/60 backdrop-blur-xl p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1 shadow-[0_4px_25px_rgba(0,0,0,0.05)] ${glowColors[config.color] ?? glowColors.slate}`}
      >
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[30px] opacity-50 ${glowBg[config.color] ?? glowBg.slate} pointer-events-none transition-opacity group-hover:opacity-100`} />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <p className="text-sm font-semibold capitalize tracking-wide text-foreground/70">{config.label}</p>
            <p className="mt-3 text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">{stat.value}</p>
          </div>
          <div className={`p-3 rounded-2xl ${iconBg[config.color] ?? iconBg.slate} border shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] shrink-0`}>
            {config.icon}
          </div>
        </div>
        <p className="mt-4 text-xs font-medium text-foreground/50 relative z-10">{config.helper}</p>
      </article>
    );
  };

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground/90 uppercase pl-2">{t("keyMetrics")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {primaryStats.map(renderCard)}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground/90 uppercase pl-2">{t("learningProgress")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {learningStats.map(renderCard)}
        </div>
      </div>
    </section>
  );
}
