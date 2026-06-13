"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

type AccordionSectionProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  isLocked?: boolean;
  lockedMessage?: string;
  unlockHint?: string;
  children: React.ReactNode;
};

export function AccordionSection({
  title,
  description,
  icon,
  defaultOpen = false,
  isLocked = false,
  lockedMessage,
  unlockHint,
  children,
}: AccordionSectionProps) {
  // Locked sections always render content (with overlay). Unlocked sections respect defaultOpen.
  const [isOpen, setIsOpen] = useState(defaultOpen || isLocked);

  return (
    <div
      className={cn(
        "surface-elevated overflow-hidden transition-colors",
        isOpen && !isLocked && "border-indigo-500/25",
      )}
    >
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        aria-disabled={isLocked || undefined}
        aria-expanded={isOpen}
        className={cn(
          "group flex w-full items-center justify-between gap-3 p-5 text-left sm:p-6",
          isLocked && "cursor-default",
        )}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {icon && (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                isOpen && !isLocked
                  ? "border-indigo-500/25 bg-indigo-500/10 text-indigo-400"
                  : "border-border bg-muted/50 text-muted-foreground",
              )}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="section-title flex flex-wrap items-center gap-2">
              {title}
              {isLocked && (
                <span className="badge-warning inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]">
                  <Lock className="h-3 w-3" />
                  {lockedMessage ?? "Locked"}
                </span>
              )}
            </h3>
            {description && (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {!isLocked && (
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="relative space-y-6 p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="h-px w-full bg-border" />
              <div className={cn(isLocked && "pointer-events-none select-none blur-[2px]")}>
                {children}
              </div>
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/55 p-6 backdrop-blur-sm">
                  <div className="surface-subtle max-w-sm space-y-2 p-5 text-center">
                    <Lock className="mx-auto h-6 w-6 text-amber-400" />
                    <p className="text-sm font-semibold text-foreground">
                      {lockedMessage ?? "Раздел временно недоступен"}
                    </p>
                    {unlockHint && <p className="text-xs text-muted-foreground">{unlockHint}</p>}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
