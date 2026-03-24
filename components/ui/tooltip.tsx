"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span className="surface-glass pointer-events-none absolute -top-9 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap px-2 py-1 text-[11px] text-slate-100">
          {content}
        </span>
      ) : null}
    </span>
  );
}
