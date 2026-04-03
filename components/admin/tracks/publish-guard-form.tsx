"use client";

import type { ActionResult } from "@/lib/admin/action-result";

interface PublishGuardFormProps {
  id: string;
  children: React.ReactNode;
  trackTitle: string;
  currentStatus: string;
  action: (fd: FormData) => Promise<ActionResult>;
}

export function PublishGuardForm({
  id,
  children,
  trackTitle,
  currentStatus,
  action,
}: PublishGuardFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const newStatus = fd.get("status") as string;
    if (currentStatus !== "PUBLISHED" && newStatus === "PUBLISHED") {
      const ok = window.confirm(
        `Publish "${trackTitle}"?\n\nThis will make it visible to all learners immediately.`,
      );
      if (!ok) {
        e.preventDefault();
      }
    }
  }

  return (
    <form id={id} action={action} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
