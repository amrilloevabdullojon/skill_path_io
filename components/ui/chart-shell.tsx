import { cn } from "@/lib/utils";

export function ChartShell({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("chart-surface space-y-3", className)}>
      {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : null}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {children}
    </section>
  );
}
