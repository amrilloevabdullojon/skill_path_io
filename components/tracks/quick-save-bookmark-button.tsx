"use client";

import { useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";

import { UserBookmark } from "@/types/personalization";

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
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (isSaving) {
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
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
      }
    } catch {
      // no-op
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={isSaving}
      className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs"
    >
      {saved ? <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-300" /> : <BookmarkPlus className="h-4 w-4 text-sky-500 dark:text-sky-300" />}
      {saved ? "Сохранено" : isSaving ? "Сохранение..." : "Сохранить"}
    </button>
  );
}
