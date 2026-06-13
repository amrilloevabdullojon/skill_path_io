"use client";

import { useMemo, useState } from "react";

import { useBrowserStorageItem } from "@/hooks/use-browser-storage";
import { useIsClient } from "@/hooks/use-is-client";
import { ProductTourStep } from "@/types/saas";

type ProductTourOverlayProps = {
  steps: ProductTourStep[];
};

const STORAGE_KEY = "skillpath:product-tour:v1";

export function ProductTourOverlay({ steps }: ProductTourOverlayProps) {
  const isClient = useIsClient();
  const tourState = useBrowserStorageItem("local", STORAGE_KEY);
  const [dismissed, setDismissed] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const step = useMemo(() => steps[stepIndex] ?? null, [stepIndex, steps]);
  const isOpen = isClient && tourState !== "done" && !dismissed;

  if (!isOpen || !step) {
    return null;
  }

  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="fixed bottom-24 left-1/2 z-[200] w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-border bg-background p-4 shadow-2xl lg:bottom-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Обзор платформы</p>
        <p className="text-xs text-muted-foreground font-mono">{stepIndex + 1} / {steps.length}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-border mb-3">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm font-semibold text-foreground">{step.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="btn-secondary px-3 py-1.5 text-xs"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "done");
            setDismissed(true);
          }}
        >
          Пропустить
        </button>
        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() => setStepIndex((prev) => prev - 1)}
            >
              Назад
            </button>
          )}
          <button
            type="button"
            className="btn-primary px-3 py-1.5 text-xs"
            onClick={() => {
              if (stepIndex >= steps.length - 1) {
                window.localStorage.setItem(STORAGE_KEY, "done");
              setDismissed(true);
                return;
              }
              setStepIndex((prev) => prev + 1);
            }}
          >
            {stepIndex >= steps.length - 1 ? "Готово" : "Далее"}
          </button>
        </div>
      </div>
    </div>
  );
}
