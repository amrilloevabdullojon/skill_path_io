"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductTourStep } from "@/types/saas";

type ProductTourOverlayProps = {
  steps: ProductTourStep[];
};

const STORAGE_KEY = "skillpath:product-tour:v1";

export function ProductTourOverlay({ steps }: ProductTourOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const done = window.localStorage.getItem(STORAGE_KEY) === "done";
    if (!done) {
      setIsOpen(true);
    }
  }, []);

  const step = useMemo(() => steps[stepIndex] ?? null, [stepIndex, steps]);

  if (!isOpen || !step) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-[90] w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-border bg-background p-4 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Product tour</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{step.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">Target section: #{step.targetId}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="btn-secondary px-3 py-1.5 text-xs"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "done");
            setIsOpen(false);
          }}
        >
          Skip tour
        </button>
        <button
          type="button"
          className="btn-primary px-3 py-1.5 text-xs"
          onClick={() => {
            if (stepIndex >= steps.length - 1) {
              window.localStorage.setItem(STORAGE_KEY, "done");
              setIsOpen(false);
              return;
            }
            setStepIndex((prev) => prev + 1);
          }}
        >
          {stepIndex >= steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
