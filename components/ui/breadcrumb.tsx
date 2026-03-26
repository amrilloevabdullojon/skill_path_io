import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex min-w-0 items-center gap-1 text-xs text-muted-foreground", className)}>
      <Link href="/tracks" className="shrink-0 transition-colors hover:text-foreground" aria-label="Tracks">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" aria-hidden />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="max-w-[160px] truncate transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "max-w-[200px] truncate",
                  isLast ? "font-medium text-foreground" : "",
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
