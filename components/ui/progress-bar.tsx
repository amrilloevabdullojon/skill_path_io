import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  fillClassName,
  label,
}: {
  value: number;
  className?: string;
  fillClassName?: string;
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn("space-y-1", className)}>
      {label ? <p className="text-xs text-slate-400">{label}</p> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn("h-full rounded-full bg-sky-400 transition-all duration-500", fillClassName)}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
