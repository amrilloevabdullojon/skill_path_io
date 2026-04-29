"use client";

import { useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import {
  AlertTriangle,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  FileText,
  Lightbulb,
  PlayCircle,
  Quote,
  Sparkles,
  Target,
} from "lucide-react";

import { AskAiHintButton } from "@/components/tracks/ask-ai-hint-button";
import { LessonBlock, LessonDecisionOption } from "@/lib/tracks/lesson-blocks";
import { cn } from "@/lib/utils";

type LessonBlockRendererProps = {
  blocks: LessonBlock[];
};

type QuickCheckState = {
  selectedIndex: number | null;
  submitted: boolean;
};

const decisionToneStyles: Record<LessonDecisionOption["tone"], string> = {
  growth: "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  risk: "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  mastery: "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

function BlockCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-subtle space-y-3 p-4 sm:p-5 border border-border/20 bg-card/40 backdrop-blur-md rounded-2xl shadow-sm ${className ?? ""}`}>
      {title ? <h3 className="section-heading text-foreground">{title}</h3> : null}
      {children}
    </section>
  );
}

export function LessonBlockRenderer({ blocks }: LessonBlockRendererProps) {
  const [quickCheckState, setQuickCheckState] = useState<Record<string, QuickCheckState>>({});
  const [challengeDrafts, setChallengeDrafts] = useState<Record<string, string>>({});
  const [challengeSubmitted, setChallengeSubmitted] = useState<Record<string, boolean>>({});
  const [lessonDecisionState, setLessonDecisionState] = useState<Record<string, string>>({});

  const orderedBlocks = useMemo(() => blocks, [blocks]);
  const lessonPanels = useMemo(() => orderedBlocks.filter((block) => block.type === "lesson_panel" && block.lesson), [orderedBlocks]);

  return (
    <div className="space-y-4">
      {lessonPanels.length > 1 ? (
        <nav className="sticky top-16 z-20 -mx-1 overflow-x-auto rounded-2xl border border-border/40 bg-background/85 p-2 shadow-lg shadow-black/5 backdrop-blur-xl">
          <div className="flex min-w-max items-center gap-2">
            {lessonPanels.map((block) => (
              <a
                key={block.id}
                href={`#${block.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-card/55 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-foreground"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] text-emerald-500">
                  {block.lesson?.order}
                </span>
                <span className="max-w-[11rem] truncate">{block.lesson?.title}</span>
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      {orderedBlocks.map((block) => {
        if (block.type === "lesson_panel") {
          const lesson = block.lesson;
          if (!lesson) {
            return null;
          }
          const selectedDecisionId = lessonDecisionState[block.id] ?? lesson.decisionOptions[0]?.id;
          const selectedDecision = lesson.decisionOptions.find((option) => option.id === selectedDecisionId) ?? lesson.decisionOptions[0];

          return (
            <article
              key={block.id}
              id={block.id}
              className="scroll-mt-28 overflow-hidden rounded-[28px] border border-emerald-500/25 bg-card/35 shadow-xl shadow-black/5 backdrop-blur-md"
            >
              <header className="relative isolate overflow-hidden border-b border-border/40 bg-emerald-500/8 p-4 sm:p-6">
                <div className="absolute right-[-5rem] top-[-6rem] h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        <BookOpenCheck className="h-3.5 w-3.5" />
                        Урок {lesson.order} из {lesson.total}
                      </span>
                      <span className="rounded-full border border-border/50 bg-card/65 px-3 py-1 text-xs text-muted-foreground">
                        Рабочая смена
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600/80 dark:text-emerald-300/80">
                        {lesson.focus}
                      </p>
                      <h3 className="mt-2 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {lesson.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:w-[26rem]">
                    <div className="rounded-2xl border border-border/40 bg-background/45 p-3">
                      <p className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                        <Target className="h-3.5 w-3.5 text-emerald-500" />
                        Миссия
                      </p>
                      <p className="mt-1 leading-5">{lesson.mission}</p>
                    </div>
                    <div className="rounded-2xl border border-border/40 bg-background/45 p-3">
                      <p className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                        <FileText className="h-3.5 w-3.5 text-emerald-500" />
                        Что сдаёте
                      </p>
                      <p className="mt-1 leading-5">{lesson.artifact}</p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="border-b border-border/40 bg-background/20 p-4 sm:p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  {lesson.shiftPlan.map((item, index) => (
                    <div key={item} className="rounded-2xl border border-border/40 bg-background/45 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                        Шаг {index + 1}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-foreground/80">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
                <article className="markdown-content min-w-0">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{block.content || ""}</ReactMarkdown>

                  {lesson.decisionOptions.length > 0 ? (
                    <section className="mt-6 rounded-3xl border border-border/50 bg-background/45 p-4 sm:p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                            <BrainCircuit className="h-4 w-4 text-emerald-500" />
                            Ветка решения
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">{lesson.decisionPrompt}</p>
                        </div>
                        <span className="w-fit rounded-full border border-border/50 bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                          выберите ход
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        {lesson.decisionOptions.map((option) => {
                          const isSelected = selectedDecision?.id === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() =>
                                setLessonDecisionState((prev) => ({
                                  ...prev,
                                  [block.id]: option.id,
                                }))
                              }
                              className={cn(
                                "rounded-2xl border border-border/50 bg-card/60 p-3 text-left text-sm transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/10",
                                isSelected && decisionToneStyles[option.tone],
                              )}
                            >
                              <span className="font-semibold">{option.label}</span>
                              <span className="mt-1 block text-xs leading-5 opacity-80">{option.artifactHint}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedDecision ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-border/50 bg-card/60 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Действие</p>
                            <p className="mt-1 text-sm leading-6 text-foreground/80">{selectedDecision.action}</p>
                          </div>
                          <div className={cn("rounded-2xl border p-3", decisionToneStyles[selectedDecision.tone])}>
                            <p className="text-xs font-semibold uppercase tracking-wide opacity-75">Последствие</p>
                            <p className="mt-1 text-sm leading-6">{selectedDecision.consequence}</p>
                          </div>
                        </div>
                      ) : null}
                    </section>
                  ) : null}
                </article>

                <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Gauge className="h-4 w-4 text-emerald-500" />
                      Готово, когда
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {lesson.doneCriteria.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background/45 p-4">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                      Чекпоинт
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.checkpoint}</p>
                  </div>
                  <AskAiHintButton question={`Помоги пройти урок "${lesson.title}" через простой рабочий пример. Фокус: ${lesson.focus}.`} />
                </aside>
              </div>
            </article>
          );
        }

        if (block.type === "heading") {
          return (
            <BlockCard key={block.id} className="border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md ring-1 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <p className="kicker text-indigo-400">Заголовок урока</p>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">{block.title || block.content}</h2>
              {block.content ? <p className="text-sm text-muted-foreground/80">{block.content}</p> : null}
            </BlockCard>
          );
        }

        if (block.type === "paragraph") {
          return (
            <BlockCard key={block.id}>
              <p className="body-text">{block.content}</p>
            </BlockCard>
          );
        }

        if (block.type === "markdown") {
          return (
            <BlockCard key={block.id} title={block.title}>
              <article className="markdown-content">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{block.content || ""}</ReactMarkdown>
              </article>
            </BlockCard>
          );
        }

        if (block.type === "list") {
          return (
            <BlockCard key={block.id} title={block.title}>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {(block.items || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </BlockCard>
          );
        }

        if (block.type === "table") {
          return (
            <BlockCard key={block.id} title={block.title}>
              <div className="table-shell">
                <table className="table-base">
                  <thead className="table-head">
                    <tr>
                      {(block.table?.headers || []).map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(block.table?.rows || []).map((row, rowIndex) => (
                      <tr key={`${block.id}-${rowIndex}`} className="table-row">
                        {row.map((cell, cellIndex) => (
                          <td key={`${block.id}-${rowIndex}-${cellIndex}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BlockCard>
          );
        }

        if (block.type === "callout" || block.type === "important_concept") {
          return (
            <BlockCard key={block.id} title={block.title} className="border-amber-500/30 bg-amber-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-500">
                <Lightbulb className="h-4 w-4" />
                Важная концепция
              </p>
              <p className="text-sm text-foreground/80">{block.content}</p>
            </BlockCard>
          );
        }

        if (block.type === "code_block") {
          return (
            <BlockCard key={block.id} title={block.title}>
              <pre className="overflow-x-auto rounded-xl border border-border/40 bg-black/40 backdrop-blur-lg p-4 text-sm text-slate-300 shadow-inner">
                <code>{block.code?.value || ""}</code>
              </pre>
            </BlockCard>
          );
        }

        if (block.type === "image") {
          return (
            <BlockCard key={block.id}>
              {block.media?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.media.url}
                  alt={block.media.alt || "Иллюстрация к уроку"}
                  className="w-full rounded-xl border border-border/80"
                />
              ) : null}
            </BlockCard>
          );
        }

        if (block.type === "video") {
          return (
            <BlockCard key={block.id} title={block.title || "Видео-объяснение"}>
              <div className="aspect-video overflow-hidden rounded-xl border border-border/80">
                <iframe
                  src={block.media?.url}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Lesson video"
                />
              </div>
            </BlockCard>
          );
        }

        if (block.type === "quote") {
          return (
            <BlockCard key={block.id}>
              <blockquote className="data-pill inline-flex items-start gap-2 rounded-xl px-4 py-3 text-sm border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm">
                <Quote className="mt-0.5 h-4 w-4 text-indigo-500" />
                <span>{block.content}</span>
              </blockquote>
            </BlockCard>
          );
        }

        if (block.type === "divider") {
          return (
            <div key={block.id} className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                следующий урок
              </span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
          );
        }

        if (block.type === "key_idea") {
          return (
            <BlockCard key={block.id} title={block.title} className="border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
              <p className="text-sm text-foreground/80">{block.content}</p>
              <AskAiHintButton question={`Объясни эту ключевую идею простыми словами: ${block.content || ""}`} />
            </BlockCard>
          );
        }

        if (block.type === "common_mistakes") {
          return (
            <BlockCard key={block.id} title={block.title} className="border-rose-500/30 bg-rose-500/10 backdrop-blur-md">
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                {(block.items || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </BlockCard>
          );
        }

        if (block.type === "real_world_example") {
          return (
            <BlockCard key={block.id} title={block.title} className="border-violet-500/30 bg-violet-500/10 backdrop-blur-md">
              <p className="text-sm text-foreground/80">{block.content}</p>
            </BlockCard>
          );
        }

        if (block.type === "quick_check") {
          const state = quickCheckState[block.id] ?? { selectedIndex: null, submitted: false };
          const qc = block.quickCheck;
          if (!qc) {
            return null;
          }
          const isCorrect = state.submitted && state.selectedIndex === qc.correctIndex;
          return (
            <BlockCard key={block.id} title={block.title || "Быстрая проверка"} className="border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md">
              <p className="text-sm font-semibold text-emerald-500">{qc.question}</p>
              <div className="space-y-2">
                {qc.options.map((option, index) => (
                  <label key={option} className="quiz-option-default flex items-start gap-2 rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm p-3 text-sm text-foreground hover:bg-card/80 transition-colors">
                    <input
                      type="radio"
                      name={block.id}
                      checked={state.selectedIndex === index}
                      onChange={() =>
                        setQuickCheckState((prev) => ({
                          ...prev,
                          [block.id]: { ...state, selectedIndex: index },
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-emerald-400"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setQuickCheckState((prev) => ({
                    ...prev,
                    [block.id]: { ...state, submitted: true },
                  }))
                }
                disabled={state.selectedIndex === null}
                className="btn-secondary"
              >
                Проверить ответ
              </button>
              {state.submitted ? (
                <div className={`rounded-xl border px-3 py-2 text-sm ${isCorrect ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                  <p className="inline-flex items-center gap-2">
                    {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {isCorrect ? "Верно!" : "Не совсем верно"}
                  </p>
                  <p className="mt-1 text-xs">{qc.explanation}</p>
                </div>
              ) : null}
            </BlockCard>
          );
        }

        if (block.type === "mini_challenge") {
          const draft = challengeDrafts[block.id] ?? "";
          const submitted = challengeSubmitted[block.id] ?? false;
          return (
            <BlockCard key={block.id} title={block.title || "Мини-задание"} className="border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md">
              <p className="text-sm font-medium text-cyan-500">{block.challengePrompt}</p>
              <textarea
                value={draft}
                onChange={(event) =>
                  setChallengeDrafts((prev) => ({
                    ...prev,
                    [block.id]: event.target.value,
                  }))
                }
                className="textarea-base min-h-[110px]"
                placeholder="Напиши короткий ответ..."
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setChallengeSubmitted((prev) => ({
                      ...prev,
                      [block.id]: true,
                    }))
                  }
                  className="btn-secondary"
                  disabled={draft.trim().length < 12}
                >
                  Отправить
                </button>
                <AskAiHintButton question={`Give me a hint for this challenge: ${block.challengePrompt || ""}`} />
              </div>
              {submitted ? (
                <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  Отлично! Следующий шаг: проверь ответ через тест или симуляцию модуля.
                </p>
              ) : block.challengeHint ? (
                <p className="text-xs text-cyan-600 dark:text-cyan-400">Подсказка: {block.challengeHint}</p>
              ) : null}
            </BlockCard>
          );
        }

        if (block.type === "summary") {
          return (
            <BlockCard key={block.id} title={block.title} className="border-border/50 bg-card/40 backdrop-blur-md">
              {block.content ? <p className="text-sm text-foreground">{block.content}</p> : null}
              {(block.items || []).length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {(block.items || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              <p className="data-pill inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
                <PlayCircle className="h-4 w-4 text-indigo-500" />
                Рекомендуемый следующий шаг: пройди тест и продолжи путь обучения.
              </p>
            </BlockCard>
          );
        }

        return null;
      })}
    </div>
  );
}
