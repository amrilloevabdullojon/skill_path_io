"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { deleteTrackAction } from "@/app/admin/actions";

export function DeleteTrackButton({
  trackId,
  trackTitle,
  moduleCount,
}: {
  trackId: string;
  trackTitle: string;
  moduleCount: number;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const cascade =
      moduleCount > 0
        ? `\n\nWARNING: This will also delete ${moduleCount} module${moduleCount !== 1 ? "s" : ""} and all their lessons!`
        : "";
    if (!confirm(`Delete track "${trackTitle}"?${cascade}\n\nThis action cannot be undone.`))
      return;
    const formData = new FormData();
    formData.set("trackId", trackId);
    startTransition(() => {
      deleteTrackAction(formData);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      aria-label={`Delete ${trackTitle}`}
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
