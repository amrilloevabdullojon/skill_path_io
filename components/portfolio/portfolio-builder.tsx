"use client";

import { useMemo, useState } from "react";
import { Download, FileJson, FileText, FolderOpenDot, Trash2 } from "lucide-react";

import {
  readPortfolioEntriesFromLocal,
  removePortfolioEntry,
  writePortfolioEntriesToLocal,
} from "@/lib/portfolio/local-portfolio";
import { PortfolioEntry, PortfolioEntrySource } from "@/types/personalization";

type PortfolioBuilderProps = {
  initialEntries: PortfolioEntry[];
};

const sourceOptions: Array<{ value: PortfolioEntrySource | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "mission", label: "Mission" },
  { value: "module", label: "Module" },
  { value: "quiz", label: "Quiz" },
  { value: "simulation", label: "Simulation" },
  { value: "certificate", label: "Certificate" },
];

function mergeEntries(runtimeEntries: PortfolioEntry[], localEntries: PortfolioEntry[]) {
  const byId = new Map<string, PortfolioEntry>();
  [...runtimeEntries, ...localEntries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((item) => byId.set(item.id, item));

  return [...byId.values()];
}

function toMarkdown(entries: PortfolioEntry[]) {
  const lines = [
    "# SkillPath Portfolio",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
  ];

  entries.forEach((entry, index) => {
    lines.push(`## ${index + 1}. ${entry.title}`);
    lines.push(`- Source: ${entry.source}`);
    lines.push(`- Created: ${new Date(entry.createdAt).toLocaleString()}`);
    lines.push(`- Skills: ${entry.skillsUsed.join(", ") || "N/A"}`);
    lines.push("");
    lines.push(entry.description);
    lines.push("");
    lines.push(`Result: ${entry.resultSummary}`);
    lines.push("");
  });

  return lines.join("\n");
}

function download(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PortfolioBuilder({ initialEntries }: PortfolioBuilderProps) {
  const [localEntries, setLocalEntries] = useState<PortfolioEntry[]>(() => readPortfolioEntriesFromLocal());
  const [sourceFilter, setSourceFilter] = useState<PortfolioEntrySource | "all">("all");

  const entries = useMemo(() => mergeEntries(initialEntries, localEntries), [initialEntries, localEntries]);
  const filteredEntries = useMemo(
    () => entries.filter((item) => (sourceFilter === "all" ? true : item.source === sourceFilter)),
    [entries, sourceFilter],
  );

  const sourceStats = useMemo(() => {
    return sourceOptions
      .filter((option) => option.value !== "all")
      .map((option) => ({
        ...option,
        count: entries.filter((item) => item.source === option.value).length,
      }));
  }, [entries]);

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-3 p-5 sm:p-6">
        <p className="kicker">Portfolio Builder</p>
        <h1 className="page-title">Show your completed work artifacts</h1>
        <p className="section-description">
          Completed missions and runtime achievements are collected here as career-ready portfolio evidence.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {sourceStats.map((item) => (
          <article key={item.value} className="surface-subtle p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{item.count}</p>
          </article>
        ))}
      </div>

      <section className="surface-elevated space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as PortfolioEntrySource | "all")}
            className="select-base h-10 w-[180px]"
          >
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() =>
              download(
                "skillpath-portfolio.json",
                JSON.stringify(filteredEntries, null, 2),
                "application/json",
              )
            }
          >
            <FileJson className="h-4 w-4" />
            Export JSON
          </button>

          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() =>
              download(
                "skillpath-portfolio.md",
                toMarkdown(filteredEntries),
                "text/markdown",
              )
            }
          >
            <FileText className="h-4 w-4" />
            Export Markdown
          </button>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="state-panel">
            <p className="inline-flex items-center gap-2">
              <FolderOpenDot className="h-4 w-4 text-muted-foreground" />
              No portfolio entries yet. Complete a mission and add it from the mission result panel.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredEntries.map((entry) => {
              const isLocal = localEntries.some((item) => item.id === entry.id);

              return (
                <article key={entry.id} className="surface-subtle space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-foreground">{entry.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.source} | {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="chip-neutral px-2.5 py-1 text-[11px]">
                        {entry.source}
                      </span>
                      {isLocal ? (
                        <button
                          type="button"
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-200 transition hover:bg-rose-500/20"
                          onClick={() => {
                            const next = removePortfolioEntry(entry.id);
                            setLocalEntries(next);
                          }}
                          aria-label="Remove portfolio entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{entry.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {entry.skillsUsed.map((skill) => (
                      <span
                        key={`${entry.id}-${skill}`}
                        className="rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="content-card px-3 py-2 text-xs text-muted-foreground">
                    {entry.resultSummary}
                  </p>
                </article>
              );
            })}
          </div>
        )}

        {localEntries.length > 0 ? (
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() => {
              setLocalEntries([]);
              writePortfolioEntriesToLocal([]);
            }}
          >
            <Download className="h-4 w-4" />
            Clear local mission artifacts
          </button>
        ) : null}
      </section>
    </section>
  );
}

