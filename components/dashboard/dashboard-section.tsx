import Link from "next/link";
import { ReactNode } from "react";

type DashboardSectionProps = {
  id?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardSection({
  id,
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section id={id} className={`surface-elevated min-w-0 space-y-4 p-5 sm:p-6 ${className ?? ""}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="section-heading">{title}</h2>
          {description ? <p className="section-subtext mt-1">{description}</p> : null}
        </div>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            {actionLabel}
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}
