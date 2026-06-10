import Link from "next/link";
import { ArrowUpRight, Compass, Flame } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { AdaptiveSuggestion } from "@/types/personalization";

function priorityVariant(priority: AdaptiveSuggestion["priority"]): BadgeProps["variant"] {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warning";
  return "success";
}

export function DashboardAdaptivePathSection({ suggestions }: { suggestions: AdaptiveSuggestion[] }) {
  return (
    <DashboardSection
      id="adaptive"
      title="Адаптивный путь"
      description="Персонализированные следующие шаги на основе ошибок в квизах, темпа и итогов симуляций."
      actionLabel="Открыть аналитику"
      actionHref="/analytics"
    >
      <div className="space-y-2">
        {suggestions.map((item) => (
          <article key={item.id} className="content-card surface-panel-hover p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>
              <Badge variant={priorityVariant(item.priority)}>{item.priority}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{item.action}</p>
            <Link href={item.href} className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200">
              <Compass className="h-3.5 w-3.5" />
              Следовать рекомендации
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        ))}
      </div>

      <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Flame className="h-3.5 w-3.5 text-amber-300" />
        Адаптивный движок переключается на ускоренный путь при повышении стабильности.
      </p>
    </DashboardSection>
  );
}
