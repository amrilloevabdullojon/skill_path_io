"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

import { deleteModuleAction } from "@/app/admin/actions";

export function DeleteModuleButton({
  moduleId,
  moduleTitle,
}: {
  moduleId: string;
  moduleTitle: string;
}) {
  const t = useTranslations("admin.modules.shared");
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t("deleteConfirm", { title: moduleTitle }))) {
      return;
    }
    const formData = new FormData();
    formData.set("moduleId", moduleId);
    startTransition(() => {
      deleteModuleAction(formData);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      title={`${t("delete")} "${moduleTitle}"`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent
                 text-muted-foreground transition-colors
                 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400
                 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
