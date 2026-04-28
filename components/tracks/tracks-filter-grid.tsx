"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

import { TrackCard } from "@/components/track-card";
import { FadeInUp } from "@/components/ui/fade-in";
import type { RuntimeTrackCardData } from "@/lib/learning/runtime-content";

type FilterCategory = "ALL" | "QA" | "BA" | "DA";
type FilterLevel = "ALL" | "Junior" | "Middle";
type FilterStatus = "ALL" | "in_progress" | "not_started" | "completed";

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  ALL: "Все треки",
  QA: "QA",
  BA: "BA",
  DA: "DA",
};

const LEVEL_LABELS: Record<FilterLevel, string> = {
  ALL: "Любой уровень",
  Junior: "Junior",
  Middle: "Middle",
};

const STATUS_LABELS: Record<FilterStatus, string> = {
  ALL: "Любой статус",
  not_started: "Не начаты",
  in_progress: "В процессе",
  completed: "Завершены",
};

type Props = {
  tracks: RuntimeTrackCardData[];
  isAuthenticated: boolean;
};

export function TracksFilterGrid({ tracks, isAuthenticated }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FilterCategory>("ALL");
  const [level, setLevel] = useState<FilterLevel>("ALL");
  const [status, setStatus] = useState<FilterStatus>("ALL");

  const filtered = useMemo(() => {
    return tracks.filter((track) => {
      if (category !== "ALL" && track.category !== category) return false;
      if (level !== "ALL" && track.level !== level) return false;
      if (isAuthenticated && status !== "ALL") {
        const p = track.progress;
        if (status === "completed" && p?.progressPercent !== 100) return false;
        if (status === "in_progress" && !(p?.isStarted && (p?.progressPercent ?? 0) < 100)) return false;
        if (status === "not_started" && p?.isStarted) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !track.title.toLowerCase().includes(q) &&
          !track.description.toLowerCase().includes(q) &&
          !track.category.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tracks, category, level, status, search, isAuthenticated]);

  const hasActiveFilters =
    category !== "ALL" || level !== "ALL" || status !== "ALL" || search.trim() !== "";

  function resetFilters() {
    setCategory("ALL");
    setLevel("ALL");
    setStatus("ALL");
    setSearch("");
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Поиск треков..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card/60 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "QA", "BA", "DA"] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border ${
                category === cat
                  ? cat === "QA"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                    : cat === "BA"
                    ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
                    : cat === "DA"
                    ? "bg-violet-500/15 border-violet-500/40 text-violet-400"
                    : "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                  : "border-border/50 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Level select */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as FilterLevel)}
          className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        >
          {(["ALL", "Junior", "Middle"] as FilterLevel[]).map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABELS[l]}
            </option>
          ))}
        </select>

        {/* Status filter (only for authenticated users) */}
        {isAuthenticated && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FilterStatus)}
            className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          >
            {(["ALL", "not_started", "in_progress", "completed"] as FilterStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        )}

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/40 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <X className="h-3 w-3" />
            Сбросить
          </button>
        )}
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "Треки не найдены"
            : `Найдено ${filtered.length} ${filtered.length === 1 ? "трек" : filtered.length < 5 ? "трека" : "треков"}`}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="surface-elevated rounded-2xl p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Ничего не найдено. Попробуйте изменить фильтры.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 btn-secondary text-xs"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((track, i) => (
            <FadeInUp key={track.id} delay={i * 0.04}>
              <TrackCard track={track} />
            </FadeInUp>
          ))}
        </div>
      )}
    </div>
  );
}
