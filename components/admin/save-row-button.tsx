"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SaveRowButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      {pending ? "Saving…" : "Save"}
    </button>
  );
}
