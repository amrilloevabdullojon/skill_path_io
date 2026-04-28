"use client";

import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { resetStudentProgressAction, seedInvestorPresentationAction } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

export function ResetProgressButton({ className }: { className?: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleReset(e: React.MouseEvent) {
    e.preventDefault();
    if (!window.confirm("Вы уверены? Это действие обнулит ВЕСЬ ваш опыт до статуса 'Новичок'.")) {
      return;
    }

    setIsPending(true);
    try {
      const result = await resetStudentProgressAction();
      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        alert(result.error ?? "Failed to reset");
      }
    } catch (e) {
      alert("Error resetting progress: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsPending(false);
    }
  }

  async function handleSeedPitchMode(e: React.MouseEvent) {
    e.preventDefault();
    if (!window.confirm("Сгенерировать идеальную обучающую историю (режим питча инвесторам)? Ваш текущий прогресс будет перезаписан красивыми демо-данными.")) {
      return;
    }

    setIsPending(true);
    try {
      const result = await seedInvestorPresentationAction();
      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        alert(result.error ?? "Failed to seed demo data");
      }
    } catch (e) {
      alert("Error generating pitch mode: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSeedPitchMode}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all rounded-full border",
          "border-indigo-500/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200",
          isPending && "opacity-50 cursor-wait",
          className
        )}
        title="Сгенерировать идеальные демо-данные"
      >
        <Sparkles className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
        Pitch Mode
      </button>

      <button
        type="button"
        onClick={handleReset}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 p-1.5 transition-all rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300",
          isPending && "opacity-50 cursor-wait",
          className
        )}
        title="Сбросить прогресс до 0 (Пустой аккаунт)"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
