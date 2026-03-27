"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { deleteLessonAction } from "@/app/admin/actions";

export function DeleteLessonButton({
  lessonId,
  lessonTitle,
}: {
  lessonId: string;
  lessonTitle: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete lesson "${lessonTitle}"?\n\nThis action cannot be undone.`)) return;
    const formData = new FormData();
    formData.set("lessonId", lessonId);
    startTransition(() => {
      deleteLessonAction(formData);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      aria-label={`Delete ${lessonTitle}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 disabled:pointer-events-none disabled:opacity-40"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
