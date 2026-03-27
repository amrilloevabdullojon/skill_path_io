"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

import { deletePermissionAction } from "@/app/admin/actions";

export function DeletePermissionButton({
  permId,
  email,
}: {
  permId: string;
  email: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Remove permission for ${email}?`)) return;
    const formData = new FormData();
    formData.set("permId", permId);
    startTransition(() => {
      void deletePermissionAction(formData);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      title={`Delete permission for ${email}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
