"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Download,
  FileJson,
  FileText,
  Filter,
  FolderOpenDot,
  Lightbulb,
  Search,
  Trash2,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import {
  readPortfolioEntriesFromLocal,
  removePortfolioEntry,
  writePortfolioEntriesToLocal,
} from "@/lib/portfolio/local-portfolio";
import type { PortfolioEntry, PortfolioEntrySource } from "@/types/personalization";
import { cn } from "@/lib/utils";

type PortfolioBuilderProps = {
  initialEntries: PortfolioEntry[];
};

type PortfolioFilter = "all" | PortfolioEntrySource;

const sourceLabels: Record<PortfolioEntrySource, string> = {
  mission: "Миссия",
  module: "Модуль",
  quiz: "Квиз",
  simulation: "Симуляция",
  certificate: "Сертификат",
};

const sourceWeights: Record<PortfolioEntrySource, number> = {
  mission: 5,
  simulation: 4,
  certificate: 4,
  quiz: 3,
  module: 2,
};

const filterOptions: Array<{ label: string; value: PortfolioFilter }> = [
  { label: "Все", value: "all" },
  { label: "Миссии", value: "mission" },
  { label: "Модули", value: "module" },
  { label: "Квизы", value: "quiz" },
  { label: "Симуляции", value: "simulation" },
  { label: "Сертификаты", value: "certificate" },
];

function getSourceLabel(source: string) {
  return sourceLabels[source as PortfolioEntrySource] ?? "Проект";
}

function getSourceWeight(source: string) {
  return sourceWeights[source as PortfolioEntrySource] ?? 3;
}

function mergeEntries(runtimeEntries: PortfolioEntry[], localEntries: PortfolioEntry[]) {
  const byId = new Map<string, PortfolioEntry>();

  [...runtimeEntries, ...localEntries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((item) => byId.set(item.id, item));

  return [...byId.values()];
}

function scoreEntry(entry: PortfolioEntry) {
  return getSourceWeight(entry.source) * 10 + entry.skillsUsed.length * 4 + Math.min(entry.resultSummary.length / 20, 12);
}

function getReadiness(entries: PortfolioEntry[]) {
  const sources = new Set(entries.map((entry) => entry.source));
  const uniqueSkills = new Set(entries.flatMap((entry) => entry.skillsUsed.filter(Boolean)));
  const hasMission = sources.has("mission");
  const hasAssessment = sources.has("quiz") || sources.has("certificate");
  const hasPractice = sources.has("simulation") || sources.has("mission");

  const score = Math.min(
    100,
    Math.round(entries.length * 11 + uniqueSkills.size * 7 + (hasMission ? 14 : 0) + (hasAssessment ? 10 : 0) + (hasPractice ? 8 : 0)),
  );

  return {
    score,
    label: score >= 80 ? "Готов к показу" : score >= 55 ? "Почти готов" : "Нужно усилить",
    tone:
      score >= 80
        ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
        : score >= 55
          ? "border-amber-400/35 bg-amber-500/10 text-amber-200"
          : "border-rose-400/35 bg-rose-500/10 text-rose-200",
  };
}

function getSkillStats(entries: PortfolioEntry[]) {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    entry.skillsUsed.forEach((skill) => {
      const normalized = skill.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([skill, count]) => ({ skill, count }));
}

function getGaps(entries: PortfolioEntry[]) {
  const sources = new Set(entries.map((entry) => entry.source));
  const skillCount = getSkillStats(entries).length;
  const gaps: string[] = [];

  if (!sources.has("mission")) gaps.push("Добавьте хотя бы одну миссию: она лучше всего показывает работу в реальном сценарии.");
  if (!sources.has("quiz")) gaps.push("Нужен диагностический квиз или оценка, чтобы подтвердить знания цифрами.");
  if (skillCount < 5) gaps.push("Расширьте набор навыков: сейчас профиль выглядит слишком узким.");
  if (entries.length < 4) gaps.push("Соберите минимум 4 доказательства, чтобы профиль не выглядел пустым.");
  if (gaps.length === 0) gaps.push("Следующий шаг: заменить слабые учебные записи на 2-3 сильных рабочих артефакта.");

  return gaps;
}

function toMarkdown(entries: PortfolioEntry[]) {
  const lines = ["# Levio Portfolio", "", `Generated at: ${new Date().toISOString()}`, ""];

  entries.forEach((entry, index) => {
    lines.push(`## ${index + 1}. ${entry.title}`);
    lines.push(`- Источник: ${getSourceLabel(entry.source)}`);
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
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("all");
  const [query, setQuery] = useState("");

  const entries = useMemo(() => mergeEntries(initialEntries, localEntries), [initialEntries, localEntries]);
  const readiness = useMemo(() => getReadiness(entries), [entries]);
  const skillStats = useMemo(() => getSkillStats(entries), [entries]);
  const gaps = useMemo(() => getGaps(entries), [entries]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const matchesFilter = activeFilter === "all" || entry.source === activeFilter;
        const matchesQuery = normalizedQuery
          ? `${entry.title} ${entry.description} ${entry.resultSummary} ${entry.skillsUsed.join(" ")}`.toLowerCase().includes(normalizedQuery)
          : true;
        return matchesFilter && matchesQuery;
      }),
    [activeFilter, entries, normalizedQuery],
  );
  const highlightedEntries = useMemo(
    () => [...entries].sort((a, b) => scoreEntry(b) - scoreEntry(a)).slice(0, 4),
    [entries],
  );
  const recentEntries = useMemo(
    () => [...filteredEntries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [filteredEntries],
  );
  const sourceCounts = useMemo(
    () =>
      entries.reduce<Record<PortfolioEntrySource, number>>(
        (acc, entry) => {
          acc[entry.source] += 1;
          return acc;
        },
        { mission: 0, module: 0, quiz: 0, simulation: 0, certificate: 0 },
      ),
    [entries],
  );

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-5 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-3xl space-y-2">
            <p className="kicker">Портфолио ученика</p>
            <h1 className="page-title leading-tight">Профиль готовности к работе</h1>
            <p className="section-description">
              Здесь собираются доказательства из модулей и миссий: что вы умеете, чем это подтверждено и что ещё стоит усилить перед публичной ссылкой.
            </p>
          </div>

          <div className={cn("rounded-lg border p-4", readiness.tone)}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Готовность</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-4xl font-semibold leading-none">{readiness.score}%</p>
              <p className="text-sm font-semibold">{readiness.label}</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/60">
              <div className="h-full rounded-full bg-current" style={{ width: `${readiness.score}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={BriefcaseBusiness} label="Доказательств" value={entries.length.toString()} />
          <Metric icon={BadgeCheck} label="Навыков" value={skillStats.length.toString()} />
          <Metric icon={Trophy} label="Лучших работ" value={highlightedEntries.length.toString()} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/missions" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Усилить</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Добавить миссию
              <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Проверить</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Закрыть слабые вопросы
              <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/career" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Цель</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Сверить с карьерой
              <BriefcaseBusiness className="h-4 w-4" />
            </p>
          </Link>
        </div>
      </header>

      {entries.length === 0 ? (
        <section className="surface-elevated p-5">
          <div className="state-panel flex flex-wrap items-center justify-between gap-4">
            <p className="inline-flex items-center gap-2">
              <FolderOpenDot className="h-4 w-4 text-muted-foreground" aria-hidden />
              Пока нет доказательств. Пройдите миссию или завершите модуль, чтобы собрать первый артефакт.
            </p>
            <div className="flex gap-2">
              <Link href="/missions" className="btn-primary px-4 py-2 text-xs">
                Открыть практику
              </Link>
              <Link href="/tracks" className="btn-secondary px-4 py-2 text-xs">
                Смотреть треки
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-5">
            <section className="surface-elevated space-y-4 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Trophy className="h-4 w-4 text-primary" />
                    Лучшие артефакты
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Эти работы лучше всего объясняют вашу практическую готовность.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-2"
                    onClick={() => download("levio-portfolio.json", JSON.stringify(entries, null, 2), "application/json")}
                  >
                    <FileJson className="h-4 w-4" />
                    JSON
                  </button>
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-2"
                    onClick={() => download("levio-portfolio.md", toMarkdown(entries), "text/markdown")}
                  >
                    <FileText className="h-4 w-4" />
                    Markdown
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {highlightedEntries.map((entry, index) => (
                  <EvidenceCard
                    key={entry.id}
                    entry={entry}
                    rank={index + 1}
                    isLocal={localEntries.some((item) => item.id === entry.id)}
                    onRemove={() => {
                      const next = removePortfolioEntry(entry.id);
                      setLocalEntries(next);
                    }}
                  />
                ))}
              </div>
            </section>

            <section className="surface-elevated space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Последние доказательства
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <label htmlFor="portfolio-search" className="relative">
                  <span className="sr-only">Поиск по портфолио</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="portfolio-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="input-base pl-9"
                    placeholder="Найти по проекту, навыку или результату"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActiveFilter(option.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                        activeFilter === option.value
                          ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                          : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                {recentEntries.length > 0 ? recentEntries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getSourceLabel(entry.source)} · {new Date(entry.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.skillsUsed.slice(0, 3).map((skill) => (
                        <span key={`${entry.id}-${skill}`} className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                    По этому фильтру доказательств нет. Сбросьте поиск или добавьте новый артефакт из миссий.
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="space-y-5">
            <section className="surface-elevated space-y-4 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                Состав портфолио
              </div>
              <div className="grid gap-2">
                {Object.entries(sourceCounts).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{getSourceLabel(source)}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-elevated space-y-4 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Подтверждённые навыки
              </div>
              {skillStats.length > 0 ? (
                <div className="space-y-2">
                  {skillStats.slice(0, 10).map(({ skill, count }) => (
                    <div key={skill} className="rounded-lg border border-border bg-background/60 p-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-foreground">{skill}</span>
                        <span className="text-xs text-muted-foreground">{count}x</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, count * 28)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-background/60 p-3 text-sm text-muted-foreground">
                  Навыки появятся после первых артефактов.
                </p>
              )}
            </section>

            <section className="surface-elevated space-y-4 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lightbulb className="h-4 w-4 text-primary" />
                Что улучшить
              </div>
              <div className="space-y-2">
                {gaps.map((gap) => (
                  <p key={gap} className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                    {gap}
                  </p>
                ))}
              </div>
            </section>

            {localEntries.length > 0 ? (
              <section className="surface-elevated space-y-3 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Download className="h-4 w-4 text-primary" />
                  Локальные записи
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Миссии, сохранённые из браузера, лежат локально. Их можно очистить, если нужно пересобрать профиль.
                </p>
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2"
                  onClick={() => {
                    setLocalEntries([]);
                    writePortfolioEntriesToLocal([]);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Очистить локальные записи
                </button>
              </section>
            ) : null}
          </aside>
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EvidenceCard({
  entry,
  rank,
  isLocal,
  onRemove,
}: {
  entry: PortfolioEntry;
  rank: number;
  isLocal: boolean;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-lg border border-border bg-background/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              #{rank}
            </span>
            <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
              {getSourceLabel(entry.source)}
            </span>
            {isLocal ? (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                из браузера
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">{entry.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
        </div>
        {isLocal ? (
          <button
            type="button"
            className="self-start rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-200 transition hover:bg-rose-500/20"
            onClick={onRemove}
            aria-label="Удалить запись"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {entry.skillsUsed.map((skill) => (
          <span key={`${entry.id}-${skill}`} className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-4 py-3 text-sm leading-relaxed text-foreground">
        <span className="font-semibold">Результат: </span>
        {entry.resultSummary}
      </div>
    </article>
  );
}
