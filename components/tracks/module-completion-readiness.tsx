"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { readPortfolioEntriesFromLocal } from "@/lib/portfolio/local-portfolio";
import { buildModuleCompletionGate } from "@/lib/tracks/artifact-readiness";
import { cn } from "@/lib/utils";

type ModuleCompletionReadinessProps = {
  moduleId: string;
  isCompleted: boolean;
};

type StoredArtifactDraft = {
  observation?: string;
  risk?: string;
  testIdea?: string;
  evidence?: string;
  decision?: string;
};

const artifactUpdatedEventName = "levio:artifact-updated";

function readArtifactFilledFields(moduleId: string) {
  try {
    const raw = window.localStorage.getItem(`levio:module-artifact:${moduleId}`);
    if (!raw) {
      return 0;
    }

    const parsed = JSON.parse(raw) as StoredArtifactDraft;
    return [parsed.observation, parsed.risk, parsed.testIdea, parsed.evidence, parsed.decision]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .length;
  } catch {
    return 0;
  }
}

export function ModuleCompletionReadiness({ moduleId, isCompleted }: ModuleCompletionReadinessProps) {
  const [filledFields, setFilledFields] = useState(0);
  const [hasPortfolioEntry, setHasPortfolioEntry] = useState(false);

  const refresh = useCallback(() => {
    setFilledFields(readArtifactFilledFields(moduleId));
    setHasPortfolioEntry(readPortfolioEntriesFromLocal().some((entry) => entry.sourceRef === moduleId));
  }, [moduleId]);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener(artifactUpdatedEventName, refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(artifactUpdatedEventName, refresh);
    };
  }, [refresh]);

  const gate = useMemo(
    () => buildModuleCompletionGate({ filledFields, hasPortfolioEntry, isCompleted }),
    [filledFields, hasPortfolioEntry, isCompleted],
  );

  return (
    <article
      className={cn(
        "rounded-2xl border p-4",
        gate.ready || isCompleted
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-amber-500/30 bg-amber-500/10",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{gate.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{gate.description}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="btn-secondary inline-flex shrink-0 items-center justify-center gap-2 px-3 py-2 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Обновить
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {gate.checklist.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs",
              item.done
                ? "border-emerald-500/30 bg-background/35 text-emerald-700 dark:text-emerald-300"
                : "border-border/50 bg-card/45 text-muted-foreground",
            )}
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", item.done ? "text-emerald-500" : "text-muted-foreground/50")} />
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
