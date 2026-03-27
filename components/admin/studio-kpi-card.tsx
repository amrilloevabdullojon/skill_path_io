import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type KpiAccent = "sky" | "violet" | "emerald" | "amber" | "rose";

const ACCENT_CLASSES: Record<KpiAccent, string> = {
  sky:     "border-sky-500/20 bg-sky-500/10 text-sky-400",
  violet:  "border-violet-500/20 bg-violet-500/10 text-violet-400",
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  amber:   "border-amber-500/20 bg-amber-500/10 text-amber-400",
  rose:    "border-rose-500/20 bg-rose-500/10 text-rose-400",
};

type StudioKpiCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  accent?: KpiAccent;
};

export function StudioKpiCard({ label, value, helper, icon, accent }: StudioKpiCardProps) {
  const iconClass = accent
    ? ACCENT_CLASSES[accent]
    : "border-border bg-card text-muted-foreground";

  return (
    <article className="surface-subtle p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="data-label">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        {icon ? (
          <span
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
              iconClass,
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
    </article>
  );
}
