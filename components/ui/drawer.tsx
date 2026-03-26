"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  className?: string;
  children: React.ReactNode;
};

export function Drawer({ open, onClose, title, side = "right", className, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <button type="button" className="overlay-backdrop-drawer absolute inset-0" onClick={onClose} aria-label="Close drawer" />
      <aside
        className={cn(
          "surface-elevated absolute bottom-0 top-0 w-[min(92vw,25rem)] p-4 transition-transform duration-300 ease-smooth",
          side === "right" ? "right-0" : "left-0",
          className,
        )}
      >
        <header className="mb-3 flex items-center justify-between gap-3">
          {title ? <h2 className="overlay-title text-base">{title}</h2> : <span />}
          <button type="button" onClick={onClose} className="btn-secondary h-9 w-9 p-0" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="h-[calc(100%-3rem)] overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
