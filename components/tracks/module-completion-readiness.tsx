"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { CheckCircle2, ClipboardCheck, FileCheck2, RefreshCw } from "lucide-react";

import { PORTFOLIO_STORAGE_KEY } from "@/lib/portfolio/local-portfolio";
import { buildModuleCompletionGate, buildModuleSubmissionBrief } from "@/lib/tracks/artifact-readiness";
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

const artifactFieldViews: Array<{
  key: keyof StoredArtifactDraft;
  label: string;
  fallback: string;
}> = [
  { key: "observation", label: "Наблюдение", fallback: "Что увидели в продукте" },
  { key: "risk", label: "Риск", fallback: "Кого и как это заденет" },
  { key: "testIdea", label: "Проверка", fallback: "Как доказать поведение" },
  { key: "evidence", label: "Evidence", fallback: "Шаги, факты, ссылки" },
  { key: "decision", label: "Вывод", fallback: "Что делать дальше" },
];

function parseArtifactDraft(raw: string | null): StoredArtifactDraft {
  try {
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as StoredArtifactDraft;
  } catch {
    return {};
  }
}

function hasPortfolioEntry(raw: string | null, moduleId: string) {
  try {
    if (!raw) return false;
    const entries = JSON.parse(raw) as Array<{ sourceRef?: string }>;
    return Array.isArray(entries) && entries.some((entry) => entry.sourceRef === moduleId);
  } catch {
    return false;
  }
}

function countArtifactFilledFields(draft: StoredArtifactDraft) {
  return artifactFieldViews.filter(({ key }) => {
    const value = draft[key];
    return typeof value === "string" && value.trim().length > 0;
  }).length;
}

function previewArtifactValue(value: string | undefined, fallback: string) {
  if (!value?.trim()) {
    return fallback;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 74 ? `${normalized.slice(0, 74)}...` : normalized;
}

export function ModuleCompletionReadiness({ moduleId, isCompleted }: ModuleCompletionReadinessProps) {
  const artifactKey = `levio:module-artifact:${moduleId}`;
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("focus", onStoreChange);
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(artifactUpdatedEventName, onStoreChange);

    return () => {
      window.removeEventListener("focus", onStoreChange);
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(artifactUpdatedEventName, onStoreChange);
    };
  }, []);

  const storageSnapshot = useSyncExternalStore(
    subscribe,
    () =>
      JSON.stringify({
        artifact: window.localStorage.getItem(artifactKey),
        portfolio: window.localStorage.getItem(PORTFOLIO_STORAGE_KEY),
      }),
    () => JSON.stringify({ artifact: null, portfolio: null }),
  );

  const { artifactDraft, hasPortfolioEntry: hasEntry } = useMemo(() => {
    const snapshot = JSON.parse(storageSnapshot) as { artifact: string | null; portfolio: string | null };
    return {
      artifactDraft: parseArtifactDraft(snapshot.artifact),
      hasPortfolioEntry: hasPortfolioEntry(snapshot.portfolio, moduleId),
    };
  }, [moduleId, storageSnapshot]);

  const filledFields = useMemo(() => countArtifactFilledFields(artifactDraft), [artifactDraft]);
  const gate = useMemo(
    () => buildModuleCompletionGate({ filledFields, hasPortfolioEntry: hasEntry, isCompleted }),
    [filledFields, hasEntry, isCompleted],
  );
  const submissionBrief = useMemo(
    () => buildModuleSubmissionBrief({ filledFields, hasPortfolioEntry: hasEntry, isCompleted }),
    [filledFields, hasEntry, isCompleted],
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
          onClick={() => window.dispatchEvent(new CustomEvent(artifactUpdatedEventName))}
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
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div
          className={cn(
            "rounded-2xl border p-4",
            submissionBrief.tone === "completed" || submissionBrief.tone === "portfolio"
              ? "border-emerald-500/30 bg-background/40"
              : submissionBrief.tone === "draft"
                ? "border-sky-500/30 bg-background/40"
                : "border-amber-500/30 bg-background/40",
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
                submissionBrief.tone === "completed" || submissionBrief.tone === "portfolio"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                  : submissionBrief.tone === "draft"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
              )}
            >
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Паспорт сдачи · {submissionBrief.maturityLabel}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-foreground">{submissionBrief.headline}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{submissionBrief.description}</p>
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-border/50 bg-card/45 px-3 py-2 text-xs leading-5 text-foreground/80">
            {submissionBrief.nextAction}
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/45 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Что сдаёте</p>
            <span className="rounded-full border border-border/50 bg-background/45 px-2 py-0.5 text-[11px] text-muted-foreground">
              {filledFields}/{artifactFieldViews.length} веток
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {artifactFieldViews.map((field) => {
              const value = artifactDraft[field.key];
              const done = typeof value === "string" && value.trim().length > 0;

              return (
                <div key={field.key} className="flex items-start gap-2 rounded-xl border border-border-subtle bg-background/35 px-3 py-2">
                  <FileCheck2 className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", done ? "text-emerald-500" : "text-muted-foreground/45")} />
                  <div className="min-w-0">
                    <p className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>{field.label}</p>
                    <p className="mt-0.5 break-words text-[11px] leading-4 text-muted-foreground">
                      {previewArtifactValue(value, field.fallback)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
