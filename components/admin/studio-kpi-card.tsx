import { ReactNode } from "react";

type StudioKpiCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
};

export function StudioKpiCard({ label, value, helper, icon }: StudioKpiCardProps) {
  return (
    <article className="surface-subtle surface-panel-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="data-label">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{value}</p>
        </div>
        {icon ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300">
            {icon}
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </article>
  );
}
