"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Plus, Trash2 } from "lucide-react";

import { UserBookmark } from "@/types/personalization";
import { EmptyState } from "@/components/ui/empty-state";

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

export function BookmarksBoard({ initialBookmarks }: { initialBookmarks: UserBookmark[] }) {
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>(initialBookmarks);
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Закладки</p>
        <h1 className="page-title">Сохранённые уроки и модули</h1>
        <p className="section-description">Добавляйте полезные материалы и используйте их в режиме быстрого повторения.</p>
      </header>

      <article className="surface-elevated grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
        <label htmlFor="bookmark-title" className="sr-only">Название закладки</label>
        <input id="bookmark-title" value={title} onChange={(event) => setTitle(event.target.value)} className="input-base" placeholder="Название закладки" />
        <label htmlFor="bookmark-href" className="sr-only">URL или путь</label>
        <input id="bookmark-href" value={href} onChange={(event) => setHref(event.target.value)} className="input-base" placeholder="/tracks/..." />
        <button type="button" onClick={addBookmark} disabled={isSubmitting} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {isSubmitting ? "Сохраняем..." : "Сохранить"}
        </button>
        {error ? <p role="alert" className="text-xs text-rose-300 md:col-span-3">{error}</p> : null}
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        {bookmarks.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={Bookmark}
              title="Закладок пока нет"
              description="Сохраняйте уроки, модули и квизы сюда, чтобы вернуться к ним в любой момент или использовать в режиме быстрого повторения."
            />
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <article key={bookmark.id} className="surface-elevated space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{bookmark.title}</p>
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
              <p className="text-xs text-muted-foreground">{bookmark.type} · {bookmark.tag}</p>
              <Link href={bookmark.href} className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
                <Bookmark className="h-4 w-4" />
                Открыть
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
