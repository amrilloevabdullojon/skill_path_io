"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

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

export function AccordionSection({ title, description, icon, defaultOpen = false, isLocked = false, lockedMessage, unlockHint, children }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen && !isLocked);

  return (
    <div className={cn(
      "overflow-hidden rounded-[28px] border bg-card/40 backdrop-blur-md transition-all duration-300 relative",
      isOpen && !isLocked ? "border-indigo-500/20 shadow-[0_8px_30px_rgba(99,102,241,0.05)]" : "border-border/50 hover:border-border/80",
      isLocked && "opacity-75 grayscale-[20%]"
    )}>
      {isOpen && !isLocked && (
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
      )}
      
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        aria-disabled={isLocked || undefined}
        aria-expanded={isLocked ? undefined : isOpen}
        className={cn("flex w-full items-center justify-between p-5 sm:p-6 text-left outline-none group relative z-10", isLocked && "cursor-not-allowed")}
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors",
              isOpen
                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                : "bg-muted/50 border-border/50 text-foreground group-hover:bg-muted"
            )}>
              {icon}
            </div>
          )}
          <div>
            <h3 className={cn(
              "text-xl sm:text-2xl font-bold transition-colors",
              isOpen ? "text-foreground drop-shadow-sm" : "text-foreground/90 group-hover:text-foreground"
            )}>
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-foreground/60 font-medium max-w-xl">
                {isLocked && lockedMessage ? <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md mr-2">🔒 {lockedMessage}</span> : null}
                {description}
              </p>
            )}
            {isLocked && unlockHint && (
              <p className="mt-1.5 text-xs font-semibold text-amber-500/80 flex items-center gap-1">
                <span>↑</span> {unlockHint}
              </p>
            )}
          </div>
        </div>
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 border shadow-sm",
          isOpen && !isLocked
            ? "rotate-180 bg-background border-border text-foreground" 
            : "bg-background/50 border-border/50 text-muted-foreground group-hover:bg-background/80 group-hover:text-foreground"
        )}>
          <ChevronDown className="h-5 w-5" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden relative z-10"
          >
            <div className="p-5 sm:p-6 pt-0 space-y-6">
              <div className="h-px w-full bg-border/50 mb-6" />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
