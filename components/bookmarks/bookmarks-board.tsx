"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Plus } from "lucide-react";

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
        <p className="kicker">Bookmarks</p>
        <h1 className="page-title">Saved lessons and modules</h1>
        <p className="section-description">Pin useful content and use it in speed review mode.</p>
      </header>

      <article className="surface-elevated grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
        <label htmlFor="bookmark-title" className="sr-only">Bookmark title</label>
        <input id="bookmark-title" value={title} onChange={(event) => setTitle(event.target.value)} className="input-base" placeholder="Bookmark title" />
        <label htmlFor="bookmark-href" className="sr-only">URL or path</label>
        <input id="bookmark-href" value={href} onChange={(event) => setHref(event.target.value)} className="input-base" placeholder="/tracks/..." />
        <button type="button" onClick={addBookmark} disabled={isSubmitting} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        {error ? <p role="alert" className="text-xs text-rose-300 md:col-span-3">{error}</p> : null}
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        {bookmarks.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState
              icon={Bookmark}
              title="No bookmarks yet"
              description="Save lessons, modules, and quizzes here to revisit them anytime or use in speed review mode."
            />
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <article key={bookmark.id} className="surface-elevated space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{bookmark.title}</p>
                <button type="button" onClick={() => removeBookmark(bookmark.id)} className="text-xs text-muted-foreground hover:text-foreground">
                  Remove
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{bookmark.type} | {bookmark.tag}</p>
              <Link href={bookmark.href} className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200">
                <Bookmark className="h-4 w-4" />
                Open bookmark
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
