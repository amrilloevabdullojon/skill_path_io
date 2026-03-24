import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("surface-elevated p-5 sm:p-6", className)}>{children}</section>;
}

export function SubtlePanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("surface-subtle p-4", className)}>{children}</section>;
}
