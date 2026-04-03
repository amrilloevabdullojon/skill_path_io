"use client";

import { useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { AlertTriangle, CheckCircle2, Lightbulb, PlayCircle, Quote, Sparkles } from "lucide-react";

import { AskAiHintButton } from "@/components/tracks/ask-ai-hint-button";
import { LessonBlock } from "@/lib/tracks/lesson-blocks";

type LessonBlockRendererProps = {
  blocks: LessonBlock[];
};

type QuickCheckState = {
  selectedIndex: number | null;
  submitted: boolean;
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
    <section className={`surface-subtle space-y-3 p-4 sm:p-5 ${className ?? ""}`}>
      {title ? <h3 className="section-heading">{title}</h3> : null}
      {children}
    </section>
  );
}

export function LessonBlockRenderer({ blocks }: LessonBlockRendererProps) {
  const [quickCheckState, setQuickCheckState] = useState<Record<string, QuickCheckState>>({});
  const [challengeDrafts, setChallengeDrafts] = useState<Record<string, string>>({});
  const [challengeSubmitted, setChallengeSubmitted] = useState<Record<string, boolean>>({});

  const orderedBlocks = useMemo(() => blocks, [blocks]);

  return (
    <div className="space-y-4">
      {orderedBlocks.map((block) => {
        if (block.type === "heading") {
          return (
            <BlockCard key={block.id} className="border-sky-400/20 bg-sky-500/5">
              <p className="kicker">Заголовок урока</p>
              <h2 className="text-2xl font-semibold text-foreground">{block.title || block.content}</h2>
              {block.content ? <p className="text-sm text-muted-foreground">{block.content}</p> : null}
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
            <BlockCard key={block.id} title={block.title} className="border-amber-400/25 bg-amber-500/8">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                <Lightbulb className="h-4 w-4" />
                Важная концепция
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300">{block.content}</p>
            </BlockCard>
          );
        }

        if (block.type === "code_block") {
          return (
            <BlockCard key={block.id} title={block.title}>
              <pre className="overflow-x-auto rounded-xl border border-border/90 bg-background p-4 text-sm text-muted-foreground">
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
              <blockquote className="data-pill inline-flex items-start gap-2 rounded-xl px-3 py-2 text-sm">
                <Quote className="mt-0.5 h-4 w-4 text-sky-500" />
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
            <BlockCard key={block.id} title={block.title} className="border-sky-400/25 bg-sky-500/8">
              <p className="text-sm text-sky-700 dark:text-sky-300">{block.content}</p>
              <AskAiHintButton question={`Объясни эту ключевую идею простыми словами: ${block.content || ""}`} />
            </BlockCard>
          );
        }

        if (block.type === "common_mistakes") {
          return (
            <BlockCard key={block.id} title={block.title} className="border-rose-400/25 bg-rose-500/8">
              <ul className="list-disc space-y-1 pl-5 text-sm text-rose-700 dark:text-rose-400">
                {(block.items || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </BlockCard>
          );
        }

        if (block.type === "real_world_example") {
          return (
            <BlockCard key={block.id} title={block.title} className="border-violet-400/25 bg-violet-500/8">
              <p className="text-sm text-violet-700 dark:text-violet-400">{block.content}</p>
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
            <BlockCard key={block.id} title={block.title || "Быстрая проверка"} className="border-emerald-400/25 bg-emerald-500/8">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{qc.question}</p>
              <div className="space-y-2">
                {qc.options.map((option, index) => (
                  <label key={option} className="quiz-option-default flex items-start gap-2 rounded-xl p-2 text-sm text-foreground">
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
            <BlockCard key={block.id} title={block.title || "Мини-задание"} className="border-cyan-400/25 bg-cyan-500/8">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">{block.challengePrompt}</p>
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
            <BlockCard key={block.id} title={block.title} className="border-border/60 bg-card/70">
              {block.content ? <p className="text-sm text-foreground">{block.content}</p> : null}
              {(block.items || []).length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {(block.items || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              <p className="data-pill inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
                <PlayCircle className="h-4 w-4 text-sky-500" />
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
