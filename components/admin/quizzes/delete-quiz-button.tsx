"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { deleteQuizAction } from "@/app/admin/actions";

export function DeleteQuizButton({
  quizId,
  quizTitle,
}: {
  quizId: string;
  quizTitle: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete quiz "${quizTitle}" and all its questions?\n\nThis action cannot be undone.`,
      )
    )
      return;
    const formData = new FormData();
    formData.set("quizId", quizId);
    startTransition(() => {
      deleteQuizAction(formData);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      aria-label={`Delete ${quizTitle}`}
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
