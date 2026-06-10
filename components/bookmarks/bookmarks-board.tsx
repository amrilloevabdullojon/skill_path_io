"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpenCheck, ClipboardList, Filter, Plus, Search, Target, Trash2 } from "lucide-react";

import { UserBookmark } from "@/types/personalization";
import { EmptyState } from "@/components/ui/empty-state";

type BookmarkFilter = "all" | UserBookmark["type"];

type ApiBookmark = {
  id: string;
  title: string;
  href: string;
  type: string;
  tag: string;
};

function mapBookmarkType(value: string): UserBookmark["type"] {
  if (value === "module" || value === "quiz" || value === "mission") {
    return value;
  }
  return "lesson";
}

function toUserBookmark(bookmark: ApiBookmark): UserBookmark {
  return {
    id: bookmark.id,
    title: bookmark.title,
    href: bookmark.href,
    type: mapBookmarkType(bookmark.type),
    tag: bookmark.tag || "General",
  };
}

const typeLabels: Record<UserBookmark["type"], string> = {
  lesson: "Урок",
  module: "Модуль",
  quiz: "Квиз",
  mission: "Миссия",
};

const filterOptions: Array<{ label: string; value: BookmarkFilter }> = [
  { label: "Все", value: "all" },
  { label: "Уроки", value: "lesson" },
  { label: "Модули", value: "module" },
  { label: "Квизы", value: "quiz" },
  { label: "Миссии", value: "mission" },
];

function getBookmarkAction(bookmark: UserBookmark) {
  if (bookmark.type === "quiz" || bookmark.href.includes("/quiz")) {
    return {
      label: "Пересдать",
      helper: "Проверить, закрыта ли ошибка",
      icon: Target,
    };
  }

  if (bookmark.type === "mission") {
    return {
      label: "Применить",
      helper: "Перенести знание в практику",
      icon: ClipboardList,
    };
  }

  return {
    label: "Разобрать",
    helper: "Вернуться к контексту",
    icon: BookOpenCheck,
  };
}

export function BookmarksBoard({ initialBookmarks }: { initialBookmarks: UserBookmark[] }) {
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>(initialBookmarks);
  const [activeFilter, setActiveFilter] = useState<BookmarkFilter>("all");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quizCount = bookmarks.filter((bookmark) => bookmark.type === "quiz" || bookmark.href.includes("/quiz")).length;
  const moduleCount = bookmarks.filter((bookmark) => bookmark.type === "module").length;
  const missionCount = bookmarks.filter((bookmark) => bookmark.type === "mission").length;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesFilter = activeFilter === "all" || bookmark.type === activeFilter;
    const matchesQuery = normalizedQuery
      ? `${bookmark.title} ${bookmark.tag} ${bookmark.href}`.toLowerCase().includes(normalizedQuery)
      : true;
    return matchesFilter && matchesQuery;
  });

  async function addBookmark() {
    if (!title.trim() || !href.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          href: href.trim(),
          type: "lesson",
          tag: "Custom",
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to save bookmark.");
      }

      const payload = (await response.json()) as { bookmark?: ApiBookmark };
      if (payload.bookmark) {
        const nextBookmark = toUserBookmark(payload.bookmark);
        setBookmarks((prev) => {
          const exists = prev.some((item) => item.id === nextBookmark.id);
          return exists ? prev : [nextBookmark, ...prev];
        });
      }

      setTitle("");
      setHref("");
    } catch {
      setError("Unable to save bookmark right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeBookmark(id: string) {
    setBookmarks((prev) => prev.filter((item) => item.id !== id));
    setError(null);

    try {
      const response = await fetch(`/api/bookmarks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to remove bookmark.");
      }
    } catch {
      setError("Unable to remove bookmark right now.");
    }
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="kicker">Закладки</p>
          <h1 className="page-title">Материалы для следующего повторения</h1>
          <p className="section-description max-w-2xl">
            Здесь не просто список ссылок. Это короткая очередь материалов, которые нужно пересмотреть, применить в практике или вернуть в тренировку после ошибок.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Всего</p>
            <p className="mt-1 text-xl font-bold text-foreground">{bookmarks.length}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Квизы</p>
            <p className="mt-1 text-xl font-bold text-foreground">{quizCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Модули</p>
            <p className="mt-1 text-xl font-bold text-foreground">{moduleCount}</p>
          </div>
          <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Повторение</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Вернуться к ошибкам
              <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
        </div>
      </header>

      <article className="surface-elevated space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label htmlFor="bookmark-title" className="sr-only">Название закладки</label>
          <input id="bookmark-title" value={title} onChange={(event) => setTitle(event.target.value)} className="input-base" placeholder="Название закладки" />
          <label htmlFor="bookmark-href" className="sr-only">URL или путь</label>
          <input id="bookmark-href" value={href} onChange={(event) => setHref(event.target.value)} className="input-base" placeholder="/tracks/..." />
          <button type="button" onClick={addBookmark} disabled={isSubmitting} className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {isSubmitting ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
        {error ? <p role="alert" className="text-xs text-rose-300">{error}</p> : null}
      </article>

      <div className="surface-elevated grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
        <label htmlFor="bookmark-search" className="relative">
          <span className="sr-only">Поиск по закладкам</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="bookmark-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-base pl-9"
            placeholder="Найти по названию, тегу или ссылке"
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
        {bookmarks.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={Bookmark}
              title="Закладок пока нет"
              description="Сохраняйте уроки, модули и квизы сюда, чтобы вернуться к ним в любой момент или использовать в режиме быстрого повторения."
              actionLabel="Открыть треки"
              actionHref="/tracks"
            />
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={Search}
              title="Ничего не найдено"
              description="Попробуйте другой запрос или сбросьте фильтр, чтобы снова увидеть всю очередь повторения."
              actionLabel="Показать все"
              onAction={() => {
                setActiveFilter("all");
                setQuery("");
              }}
            />
          </div>
        ) : (
          filteredBookmarks.map((bookmark) => {
            const action = getBookmarkAction(bookmark);
            const ActionIcon = action.icon;

            return (
            <article key={bookmark.id} className="surface-elevated space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="inline-flex rounded-full border border-border/50 bg-background/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {typeLabels[bookmark.type]} · {bookmark.tag}
                  </span>
                  <p className="text-sm font-semibold text-foreground">{bookmark.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBookmark(bookmark.id)}
                  title="Удалить закладку"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Удалить
                </button>
              </div>

              <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">{action.helper}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground/80">{bookmark.href}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={bookmark.href} className="btn-primary inline-flex items-center gap-2 rounded-lg">
                  <ActionIcon className="h-4 w-4" />
                  {action.label}
                </Link>
                {missionCount > 0 && bookmark.type !== "mission" ? (
                  <Link href="/missions" className="btn-secondary inline-flex items-center gap-2 rounded-lg">
                    <ClipboardList className="h-4 w-4" />
                    Практика
                  </Link>
                ) : null}
              </div>
            </article>
            );
          })
        )}
      </div>
    </section>
  );
}
