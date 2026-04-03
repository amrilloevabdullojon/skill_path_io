"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TrackStickyProgressProps = {
  progressPercent: number;
  completedCount: number;
  totalModules: number;
  ctaHref: string;
  ctaLabel: string;
  accentProgress: string;
};

export function TrackStickyProgress({
  progressPercent,
  completedCount,
  totalModules,
  ctaHref,
  ctaLabel,
  accentProgress,
}: TrackStickyProgressProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[3.75rem] z-50 px-3 pb-2 transition-all duration-300 lg:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/95 px-4 py-2.5 shadow-xl shadow-black/30 backdrop-blur-md">
        {/* Progress info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedCount}/{totalModules} модулей
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {progressPercent}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                accentProgress,
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={ctaHref}
          className="btn-primary inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
