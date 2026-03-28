import Link from "next/link";

import { cn } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────────────────────

export function buildPageHref(
  base: string,
  params: Record<string, string | undefined>,
  newPage: number,
) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v);
  }
  qs.set("page", String(newPage));
  return `${base}?${qs.toString()}`;
}

/** Returns the page numbers + "…" placeholders to render. */
function pageWindows(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | "…"> = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}

// ── component ──────────────────────────────────────────────────────────────

interface PaginationProps {
  /** Current page number (1-based). */
  page: number;
  totalPages: number;
  /** E.g. "/admin/users". */
  basePath: string;
  /** Existing search params (excluding "page"). */
  params: Record<string, string | undefined>;
  /** Human label for the items, e.g. "users", "lessons", "certificates". */
  itemLabel: string;
  /** First item index on this page (1-based). */
  from: number;
  /** Last item index on this page (1-based). */
  to: number;
  /** Total matching records across all pages. */
  total: number;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
  itemLabel,
  from,
  to,
  total,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const windows = pageWindows(page, totalPages);

  return (
    <div className="surface-elevated p-4 flex items-center justify-between gap-4 flex-wrap">
      {/* Left: count label */}
      <p className="text-xs text-muted-foreground shrink-0">
        Showing {from}–{to} of {total} {itemLabel}
      </p>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        {/* ← Prev */}
        {page > 1 ? (
          <Link
            href={buildPageHref(basePath, params, page - 1)}
            className="btn-secondary inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium"
          >
            ← Prev
          </Link>
        ) : (
          <span className="btn-secondary inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium opacity-40 pointer-events-none">
            ← Prev
          </span>
        )}

        {/* Page numbers */}
        {windows.map((w, i) =>
          w === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex h-8 w-7 items-center justify-center text-xs text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Link
              key={w}
              href={buildPageHref(basePath, params, w)}
              className={cn(
                "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium border border-transparent transition-colors",
                w === page
                  ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                  : "btn-secondary",
              )}
            >
              {w}
            </Link>
          ),
        )}

        {/* Next → */}
        {page < totalPages ? (
          <Link
            href={buildPageHref(basePath, params, page + 1)}
            className="btn-secondary inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium"
          >
            Next →
          </Link>
        ) : (
          <span className="btn-secondary inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium opacity-40 pointer-events-none">
            Next →
          </span>
        )}
      </div>
    </div>
  );
}
