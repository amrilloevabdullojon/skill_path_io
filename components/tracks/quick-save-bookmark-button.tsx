"use client";

import { useMemo, useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { useBrowserStorageItem } from "@/hooks/use-browser-storage";
import { UserBookmark } from "@/types/personalization";

const SAVED_BOOKMARKS_KEY = "levio:bookmarks:saved";

function readSavedSet(raw?: string | null): Set<string> {
  try {
    raw ??= typeof window === "undefined" ? null : window.localStorage.getItem(SAVED_BOOKMARKS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function persistSaved(href: string) {
  if (typeof window === "undefined") return;
  const set = readSavedSet();
  set.add(href);
  try {
    window.localStorage.setItem(SAVED_BOOKMARKS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function QuickSaveBookmarkButton({
  title,
  href,
  tag,
  type = "lesson",
}: {
  title: string;
  href: string;
  tag: string;
  type?: UserBookmark["type"];
}) {
  const rawBookmarks = useBrowserStorageItem("local", SAVED_BOOKMARKS_KEY);
  const persistedSaved = useMemo(() => readSavedSet(rawBookmarks).has(href), [href, rawBookmarks]);
  const [optimisticSaved, setOptimisticSaved] = useState(false);
  const saved = persistedSaved || optimisticSaved;
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  async function save() {
    if (isSaving || saved) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          href,
          type,
          tag,
        } satisfies {
          title: string;
          href: string;
          type: UserBookmark["type"];
          tag: string;
        }),
      });
      if (response.ok) {
        setOptimisticSaved(true);
        persistSaved(href);
        toast.success("Сохранено в закладки", title);
      } else {
        toast.error("Не удалось сохранить", "Попробуйте ещё раз через минуту.");
      }
    } catch {
      toast.error("Сетевая ошибка", "Проверьте соединение и повторите.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={isSaving || saved}
      aria-pressed={saved}
      className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-100"
    >
      {saved ? <BookmarkCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-300" aria-hidden /> : <BookmarkPlus className="h-4 w-4 text-indigo-500 dark:text-indigo-300" aria-hidden />}
      {saved ? "В закладках" : isSaving ? "Сохранение..." : "Сохранить"}
    </button>
  );
}
