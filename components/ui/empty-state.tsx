import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  actionHref,
  onAction,
  size = "md",
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "state-panel flex flex-col items-center",
        size === "sm" && "py-6",
        size === "md" && "py-10",
        size === "lg" && "py-16",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-2xl border border-border/60 bg-card/50",
          size === "sm" && "h-10 w-10",
          size === "md" && "h-14 w-14",
          size === "lg" && "h-18 w-18",
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            size === "sm" && "h-4 w-4",
            size === "md" && "h-6 w-6",
            size === "lg" && "h-8 w-8",
          )}
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg",
        )}
      >
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">{description}</p>
      {actionLabel && (actionHref ?? onAction) ? (
        actionHref ? (
          <Link href={actionHref} className="btn-secondary mt-5 inline-flex">
            {actionLabel}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className="btn-secondary mt-5 inline-flex">
            {actionLabel}
          </button>
        )
      ) : null}
    </section>
  );
}
