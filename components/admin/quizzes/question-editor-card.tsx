"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Loader2, Plus, Save, X } from "lucide-react";
import { QuestionType } from "@prisma/client";

import { updateQuestionAction } from "@/app/admin/actions";
import { DeleteQuestionButton } from "@/components/admin/quizzes/delete-question-button";
import { cn } from "@/lib/utils";

type EditableOption = {
  id: string;
  text: string;
};

type QuestionEditorCardProps = {
  question: {
    id: string;
    text: string;
    type: QuestionType;
    options: EditableOption[];
    correctAnswer: string[];
  };
  index: number;
};

const typeLabel: Record<QuestionType, string> = {
  SINGLE: "Один ответ",
  MULTI: "Несколько ответов",
};

function nextOptionId(options: EditableOption[]) {
  const used = new Set(options.map((option) => option.id));
  let index = options.length + 1;
  while (used.has(`opt-${index}`)) index += 1;
  return `opt-${index}`;
}

export function QuestionEditorCard({ question, index }: QuestionEditorCardProps) {
  const [text, setText] = useState(question.text);
  const [type, setType] = useState<QuestionType>(question.type);
  const [options, setOptions] = useState<EditableOption[]>(question.options);
  const [correct, setCorrect] = useState<Set<string>>(new Set(question.correctAnswer));
  const [actionError, setActionError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const filledOptions = options.filter((option) => option.text.trim());
  const isValid = text.trim().length > 0 && filledOptions.length >= 2 && correct.size > 0;

  function updateOption(indexToUpdate: number, value: string) {
    setOptions((prev) => prev.map((option, optionIndex) => (
      optionIndex === indexToUpdate ? { ...option, text: value } : option
    )));
    setSaved(false);
  }

  function removeOption(indexToRemove: number) {
    const option = options[indexToRemove];
    setOptions((prev) => prev.filter((_, optionIndex) => optionIndex !== indexToRemove));
    setCorrect((prev) => {
      const next = new Set(prev);
      if (option) next.delete(option.id);
      return next;
    });
    setSaved(false);
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, { id: nextOptionId(prev), text: "" }]);
    setSaved(false);
  }

  function toggleCorrect(optionId: string) {
    setSaved(false);
    if (type === QuestionType.SINGLE) {
      setCorrect(new Set([optionId]));
      return;
    }

    setCorrect((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  }

  function changeType(nextType: QuestionType) {
    setType(nextType);
    setSaved(false);
    if (nextType === QuestionType.SINGLE && correct.size > 1) {
      setCorrect(new Set(Array.from(correct).slice(0, 1)));
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) return;

    const formData = new FormData();
    formData.set("questionId", question.id);
    formData.set("text", text.trim());
    formData.set("type", type);
    filledOptions.forEach((option) => {
      formData.append("optionId", option.id);
      formData.append("optionText", option.text.trim());
    });
    Array.from(correct).forEach((item) => formData.append("correct", item));

    startTransition(async () => {
      const result = await updateQuestionAction(formData);
      if (!result.ok) {
        setActionError(result.error);
        setSaved(false);
        return;
      }
      setActionError(null);
      setSaved(true);
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">
              Вопрос {index + 1}
            </span>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-300">
              {typeLabel[type]}
            </span>
            {saved ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5" />
                Сохранено
              </span>
            ) : null}
          </div>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSaved(false);
            }}
            rows={2}
            className="input-base mt-3 resize-none text-sm"
            placeholder="Текст вопроса"
          />
        </div>
        <DeleteQuestionButton questionId={question.id} questionText={question.text} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[QuestionType.SINGLE, QuestionType.MULTI].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeType(item)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-bold transition",
              type === item
                ? "border-amber-400 bg-amber-400/15 text-amber-700 dark:text-amber-300"
                : "border-border text-muted-foreground hover:border-amber-400/50 hover:text-foreground",
            )}
          >
            {typeLabel[item]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {options.map((option, optionIndex) => {
          const isCorrect = correct.has(option.id);
          return (
            <div key={option.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => option.text.trim() && toggleCorrect(option.id)}
                className={cn(
                  "h-8 w-8 shrink-0 rounded-xl border text-xs font-black transition",
                  isCorrect && option.text.trim()
                    ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                    : "border-border bg-background text-muted-foreground",
                )}
                title="Отметить правильный ответ"
              >
                {isCorrect && option.text.trim() ? "✓" : String.fromCharCode(65 + optionIndex)}
              </button>
              <input
                value={option.text}
                onChange={(event) => updateOption(optionIndex, event.target.value)}
                className="input-base h-9 flex-1 px-3 py-1 text-sm"
                placeholder={`Вариант ${String.fromCharCode(65 + optionIndex)}`}
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-rose-500/10 hover:text-rose-500"
                  aria-label="Удалить вариант"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 6}
          className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить вариант
        </button>
        <button
          type="submit"
          disabled={pending || !isValid}
          className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Сохраняю..." : "Сохранить вопрос"}
        </button>
      </div>

      {actionError ? (
        <p role="alert" className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
          {actionError}
        </p>
      ) : null}
      {!isValid ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Нужно заполнить вопрос, минимум два варианта и отметить правильный ответ.
        </p>
      ) : null}
    </form>
  );
}
