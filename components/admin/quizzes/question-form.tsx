"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { QuestionType } from "@prisma/client";

import { createQuestionAction } from "@/app/admin/actions";

export function QuestionForm({ quizId }: { quizId: string }) {
  const [type, setType] = useState<QuestionType>(QuestionType.SINGLE);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrect(new Set());
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function toggleCorrect(value: string) {
    if (type === QuestionType.SINGLE) {
      setCorrect(new Set([value]));
    } else {
      setCorrect((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current!;
    const text = (form.elements.namedItem("text") as HTMLTextAreaElement).value.trim();
    const filledOptions = options.filter((o) => o.trim().length > 0);

    if (!text || filledOptions.length < 2 || correct.size === 0) return;

    const formData = new FormData();
    formData.set("quizId", quizId);
    formData.set("text", text);
    formData.set("type", type);
    filledOptions.forEach((o) => formData.append("option", o));
    Array.from(correct).forEach((c) => formData.append("correct", c));

    startTransition(async () => {
      const result = await createQuestionAction(formData);
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      setActionError(null);
      // Reset form
      (form.elements.namedItem("text") as HTMLTextAreaElement).value = "";
      setOptions(["", "", "", ""]);
      setCorrect(new Set());
      setType(QuestionType.SINGLE);
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Question text */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Question text *
        </label>
        <textarea
          name="text"
          required
          rows={3}
          placeholder="Enter the question…"
          className="input-base resize-none text-sm"
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Answer type
        </label>
        <div className="flex gap-2">
          {[QuestionType.SINGLE, QuestionType.MULTI].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCorrect(new Set());
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                type === t
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
            >
              {t === QuestionType.SINGLE ? "Single answer" : "Multiple answers"}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Options — click to mark correct {type === QuestionType.SINGLE ? "(one)" : "(multiple)"}
        </label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => opt.trim() && toggleCorrect(opt.trim())}
                title="Mark as correct answer"
                className={`h-5 w-5 shrink-0 rounded border transition-colors ${
                  correct.has(opt.trim()) && opt.trim()
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="block text-center text-[10px] font-bold leading-5">
                  {correct.has(opt.trim()) && opt.trim() ? "✓" : String.fromCharCode(65 + i)}
                </span>
              </button>
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="input-base h-8 flex-1 px-2 py-1 text-sm"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-muted-foreground hover:text-rose-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            Add option
          </button>
        )}
      </div>

      {/* Validation hint */}
      {correct.size === 0 && options.some((o) => o.trim()) && (
        <p className="text-xs text-amber-400">
          Click an option letter to mark it as the correct answer.
        </p>
      )}

      {actionError && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          {actionError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {pending ? "Adding…" : "Add question"}
      </button>
    </form>
  );
}
