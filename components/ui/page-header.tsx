import Link from "next/link";
import { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  aside?: ReactNode;
  className?: string;
};

export function PageHeader({
  kicker,
  title,
  description,
  actionLabel,
  actionHref,
  aside,
  className,
}: PageHeaderProps) {
  return (
    <header className={`page-header ${className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {kicker ? <p className="kicker">{kicker}</p> : null}
          <h1 className="page-title">{title}</h1>
          {description ? <p className="section-description max-w-3xl">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {aside}
          {actionLabel && actionHref ? (
            <Link href={actionHref} className="btn-secondary">
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
