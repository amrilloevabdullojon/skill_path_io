import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

type StatePanelProps = {
  title: string;
  description?: string;
  variant?: "empty" | "loading" | "error";
  className?: string;
};

function iconByVariant(variant: NonNullable<StatePanelProps["variant"]>) {
  if (variant === "loading") {
    return <Loader2 className="h-4 w-4 animate-spin text-sky-300" />;
  }
  if (variant === "error") {
    return <AlertTriangle className="h-4 w-4 text-rose-300" />;
  }
  return <Inbox className="h-4 w-4 text-slate-400" />;
}

export function StatePanel({ title, description, variant = "empty", className }: StatePanelProps) {
  const icon = iconByVariant(variant);
  const variantClass =
    variant === "error"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
      : variant === "loading"
        ? "border-sky-500/30 bg-sky-500/10 text-sky-100"
        : "border-slate-800 bg-slate-950/65 text-slate-200";

  return (
    <div className={`state-panel ${variantClass} ${className ?? ""}`}>
      <p className="inline-flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </p>
      {description ? <p className="mt-2 text-xs opacity-85">{description}</p> : null}
    </div>
  );
}
