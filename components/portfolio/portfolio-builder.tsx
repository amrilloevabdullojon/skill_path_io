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
  { value: "all", label: "Все" },
  { value: "mission", label: "Миссии" },
  { value: "module", label: "Модули" },
  { value: "quiz", label: "Квизы" },
  { value: "simulation", label: "Симуляции" },
  { value: "certificate", label: "Сертификаты" },
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
    "# Levio Portfolio",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
  ];

  entries.forEach((entry, index) => {
    lines.push(`## ${index + 1}. ${entry.title}`);
    lines.push(`- Источник: ${entry.source}`);
    lines.push(`- Добавлено: ${new Date(entry.createdAt).toLocaleString("ru-RU")}`);
    lines.push(`- Навыки: ${entry.skillsUsed.join(", ") || "Нет данных"}`);
    lines.push("");
    lines.push(entry.description);
    lines.push("");
    lines.push(`Результат: ${entry.resultSummary}`);
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
        <p className="kicker">Конструктор портфолио</p>
        <h1 className="page-title">Ваши артефакты и проекты</h1>
        <p className="section-description">
          Пройденные миссии и учебные достижения собираются здесь для формирования публичного портфолио.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {sourceStats.map((item) => (
          <article key={item.value} className="surface-elevated p-4 border border-border/50 bg-card/40 hover:bg-indigo-500/5 hover:border-indigo-500/20 backdrop-blur-md transition-all shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground text-indigo-400">{item.count}</p>
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
                "levio-portfolio.json",
                JSON.stringify(filteredEntries, null, 2),
                "application/json",
              )
            }
          >
            <FileJson className="h-4 w-4" />
            Экспорт JSON
          </button>

          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() =>
              download(
                "levio-portfolio.md",
                toMarkdown(filteredEntries),
                "text/markdown",
              )
            }
          >
            <FileText className="h-4 w-4" />
            Экспорт Markdown
          </button>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="state-panel">
            <p className="inline-flex items-center gap-2">
              <FolderOpenDot className="h-4 w-4 text-muted-foreground" />
              Пока нет записей. Пройдите миссию или модуль, чтобы добавить сюда проект.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredEntries.map((entry) => {
              const isLocal = localEntries.some((item) => item.id === entry.id);

              return (
                <article key={entry.id} className="surface-elevated space-y-4 p-5 border border-border/50 bg-card/40 hover:bg-card/60 backdrop-blur-md transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(14,165,233,0.1)] group">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/40 pb-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{entry.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.source} | {new Date(entry.createdAt).toLocaleString("ru-RU")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300">
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
                          aria-label="Удалить запись"
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
                        className="rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3 text-sm text-foreground shadow-sm">
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
            Удалить локальные миссии
          </button>
        ) : null}
      </section>
    </section>
  );
}

