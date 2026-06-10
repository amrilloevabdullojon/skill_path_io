"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  ClipboardList,
  Filter,
  NotebookPen,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { TrackTag, UserNote } from "@/types/personalization";
import { EmptyState } from "@/components/ui/empty-state";

type NoteFilter = "all" | TrackTag;

type ApiNote = {
  id: string;
  title: string;
  content: string;
  moduleRef: string;
  lessonRef: string;
  createdAt: string;
};

function mapTrack(moduleRef: string): UserNote["track"] {
  const normalized = moduleRef.toLowerCase();
  if (normalized.includes("ba") || normalized.includes("business")) {
    return "BA";
  }
  if (normalized.includes("da") || normalized.includes("data") || normalized.includes("sql")) {
    return "DA";
  }
  return "QA";
}

function toUserNote(note: ApiNote): UserNote {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    track: mapTrack(note.moduleRef),
    lessonRef: note.lessonRef || note.moduleRef || "Общая заметка",
    createdAt: note.createdAt,
  };
}

const trackLabels: Record<TrackTag, string> = {
  QA: "QA",
  BA: "BA",
  DA: "Data",
};

const filterOptions: Array<{ label: string; value: NoteFilter }> = [
  { label: "Все", value: "all" },
  { label: "QA", value: "QA" },
  { label: "BA", value: "BA" },
  { label: "Data", value: "DA" },
];

function getNoteAction(note: UserNote) {
  const content = `${note.title} ${note.content} ${note.lessonRef}`.toLowerCase();

  if (content.includes("ошиб") || content.includes("quiz") || content.includes("квиз")) {
    return {
      label: "В повторение",
      href: "/review",
      helper: "Проверить эту мысль на слабых вопросах",
      icon: ArrowRight,
    };
  }

  if (content.includes("check") || content.includes("чек") || content.includes("criteria") || content.includes("критер")) {
    return {
      label: "В практику",
      href: "/missions",
      helper: "Превратить заметку в рабочий шаг",
      icon: ClipboardList,
    };
  }

  return {
    label: "К трекам",
    href: "/tracks",
    helper: "Найти урок, где эта идея применяется",
    icon: NotebookPen,
  };
}

export function NotesBoard({ initialNotes }: { initialNotes: UserNote[] }) {
  const [notes, setNotes] = useState<UserNote[]>(initialNotes);
  const [activeFilter, setActiveFilter] = useState<NoteFilter>("all");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [track, setTrack] = useState<TrackTag>("QA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qaCount = notes.filter((note) => note.track === "QA").length;
  const baCount = notes.filter((note) => note.track === "BA").length;
  const daCount = notes.filter((note) => note.track === "DA").length;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredNotes = notes.filter((note) => {
    const matchesFilter = activeFilter === "all" || note.track === activeFilter;
    const matchesQuery = normalizedQuery
      ? `${note.title} ${note.content} ${note.lessonRef}`.toLowerCase().includes(normalizedQuery)
      : true;
    return matchesFilter && matchesQuery;
  });

  async function addNote() {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          lessonRef: "Ручная заметка",
          track,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to save note.");
      }

      const payload = (await response.json()) as { note?: ApiNote };
      if (payload.note) {
        setNotes((prev) => [toUserNote(payload.note as ApiNote), ...prev]);
      }
      setTitle("");
      setContent("");
    } catch {
      setError("Unable to save note right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeNote(id: string) {
    setNotes((prev) => prev.filter((item) => item.id !== id));
    setError(null);

    try {
      const response = await fetch(`/api/notes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to remove note.");
      }
    } catch {
      setError("Unable to remove note right now.");
    }
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="kicker">Заметки</p>
          <h1 className="page-title">Рабочая тетрадь обучения</h1>
          <p className="section-description max-w-2xl">
            Фиксируйте идеи так, чтобы потом быстро вернуть их в повторение, практику или следующий урок. Конспект должен помогать действовать, а не просто лежать текстом.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Всего</p>
            <p className="mt-1 text-xl font-bold text-foreground">{notes.length}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">QA / BA / Data</p>
            <p className="mt-1 text-xl font-bold text-foreground">{qaCount}/{baCount}/{daCount}</p>
          </div>
          <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Повторение</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Слабые вопросы
              <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/bookmarks" className="rounded-xl border border-border/50 bg-background/40 p-3 transition-colors hover:bg-background/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Материалы</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              К закладкам
              <Bookmark className="h-4 w-4" />
            </p>
          </Link>
        </div>
      </header>

      <article className="surface-elevated space-y-3 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label htmlFor="note-title" className="sr-only">Заголовок заметки</label>
          <input id="note-title" value={title} onChange={(event) => setTitle(event.target.value)} className="input-base" placeholder="Заголовок заметки" />
          <label htmlFor="note-track" className="sr-only">Направление</label>
          <select
            id="note-track"
            value={track}
            onChange={(event) => setTrack(event.target.value as TrackTag)}
            className="input-base min-w-[140px]"
          >
            <option value="QA">QA</option>
            <option value="BA">BA</option>
            <option value="DA">Data</option>
          </select>
        </div>
        <label htmlFor="note-content" className="sr-only">Текст заметки</label>
        <textarea
          id="note-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="textarea-base min-h-[120px]"
          placeholder="Запишите идею, ошибку, критерий или рабочий чек-лист..."
        />
        <button type="button" onClick={addNote} disabled={isSubmitting} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {isSubmitting ? "Сохраняем..." : "Добавить заметку"}
        </button>
        {error ? <p role="alert" className="text-xs text-rose-300">{error}</p> : null}
      </article>

      <div className="surface-elevated grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
        <label htmlFor="note-search" className="relative">
          <span className="sr-only">Поиск по заметкам</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="note-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-base pl-9"
            placeholder="Найти по идее, уроку или чек-листу"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFilter(option.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                activeFilter === option.value
                  ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                  : "border-border/50 bg-background/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {notes.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={NotebookPen}
              title="Заметок пока нет"
              description="Фиксируйте ключевые идеи, подсказки и напоминания во время учёбы — они появятся здесь для быстрого повторения."
              actionLabel="Открыть треки"
              actionHref="/tracks"
            />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={Search}
              title="Заметки не найдены"
              description="Измените запрос или сбросьте фильтр, чтобы увидеть всю рабочую тетрадь."
              actionLabel="Показать все"
              onAction={() => {
                setActiveFilter("all");
                setQuery("");
              }}
            />
          </div>
        ) : (
          filteredNotes.map((note) => {
            const action = getNoteAction(note);
            const ActionIcon = action.icon;

            return (
            <article key={note.id} className="surface-elevated space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex rounded-full border border-border/50 bg-background/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {trackLabels[note.track]} · {note.lessonRef}
                  </span>
                  <p className="text-sm font-semibold text-foreground">{note.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNote(note.id)}
                  title="Удалить заметку"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Удалить
                </button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{note.content}</p>
              <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">{action.helper}</p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  Создано: {new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(new Date(note.createdAt))}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={action.href} className="btn-primary inline-flex items-center gap-2 rounded-lg">
                  <ActionIcon className="h-4 w-4" />
                  {action.label}
                </Link>
                <Link href="/bookmarks" className="btn-secondary inline-flex items-center gap-2 rounded-lg">
                  <Bookmark className="h-4 w-4" />
                  Материалы
                </Link>
              </div>
            </article>
            );
          })
        )}
      </div>
    </section>
  );
}
