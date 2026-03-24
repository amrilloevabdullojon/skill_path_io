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
        "surface-panel surface-panel-hover rounded-2xl border-slate-800/80 bg-slate-950/70 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{helper}</p>
    </article>
  );
}
