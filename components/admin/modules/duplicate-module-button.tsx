"use client";

import { useTransition } from "react";
import { Copy, Loader2 } from "lucide-react";

import { duplicateModuleAction } from "@/app/admin/actions";

export function DuplicateModuleButton({ moduleId }: { moduleId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDuplicate() {
    const formData = new FormData();
    formData.set("moduleId", moduleId);
    startTransition(() => {
      void duplicateModuleAction(formData);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDuplicate}
      title="Duplicate module"
      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {pending ? "Copying…" : "Dupe"}
    </button>
  );
}
