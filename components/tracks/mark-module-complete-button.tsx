"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type MarkModuleCompleteButtonProps = {
  isCompleted: boolean;
};

export function MarkModuleCompleteButton({ isCompleted }: MarkModuleCompleteButtonProps) {
  const { pending } = useFormStatus();
  const disabled = isCompleted || pending;

  return (
    <Button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 border border-emerald-400/50 bg-emerald-400 text-emerald-950 shadow-[0_10px_24px_rgba(52,211,153,0.3)] hover:bg-emerald-300 disabled:border-border disabled:bg-card disabled:text-muted-foreground sm:w-auto"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      {isCompleted ? "Already completed" : pending ? "Saving..." : "Mark as completed"}
    </Button>
  );
}
