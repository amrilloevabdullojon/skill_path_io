import { Award, BookOpenCheck, CheckCircle2, Medal, Sparkles, Timer } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardActivityItem } from "@/lib/dashboard/data";

type DashboardRecentActivityProps = {
  activity: DashboardActivityItem[];
};

function activityIcon(item: DashboardActivityItem["kind"]) {
  if (item === "lesson") {
    return <BookOpenCheck className="h-4 w-4 text-indigo-300" />;
  }
  if (item === "quiz") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  }
  if (item === "skill") {
    return <Sparkles className="h-4 w-4 text-violet-300" />;
  }
  if (item === "badge") {
    return <Medal className="h-4 w-4 text-amber-300" />;
  }
  if (item === "simulation") {
    return <Timer className="h-4 w-4 text-cyan-300" />;
  }
  return <Award className="h-4 w-4 text-orange-300" />;
}

export async function DashboardRecentActivitySection({ activity }: DashboardRecentActivityProps) {
  const t = await getTranslations("dashboard.recentActivity");
  const locale = await getLocale();

  function formatDateTime(date: Date) {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return (
    <DashboardSection
      id="activity"
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-3">
        {activity.length === 0 ? (
          <EmptyState
            icon={BookOpenCheck}
            title={t("empty.title")}
            description={t("empty.description")}
            actionLabel={t("empty.action")}
            actionHref="/tracks"
            size="sm"
          />
        ) : (
          activity.map((item) => (
            <article
              key={item.id}
              className="content-card surface-panel-hover relative p-4 pl-12"
            >
              <span className="icon-badge absolute left-4 top-4 h-7 w-7">
                {activityIcon(item.kind)}
              </span>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{formatDateTime(item.timestamp)}</p>
            </article>
          ))
        )}
      </div>
    </DashboardSection>
  );
}
