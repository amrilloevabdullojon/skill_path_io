import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  className?: string;
};

export function MetricCard({ label, value, helper, icon, className }: MetricCardProps) {
  return (
    <article
      className={cn(
        "surface-panel surface-panel-hover rounded-2xl p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="data-label">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <span className="metric-icon-wrap">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
    </article>
  );
}
