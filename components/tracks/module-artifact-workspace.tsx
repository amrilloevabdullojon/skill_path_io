"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Loader2, RotateCcw, Save, Sparkles, Trophy } from "lucide-react";

import { upsertPortfolioEntry } from "@/lib/portfolio/local-portfolio";
import { cn } from "@/lib/utils";

type ReviewResult = {
  score?: number;
  accuracy?: number;
  completeness?: number;
  logic?: number;
  feedback?: string[];
  nextSteps?: string[];
};

type WorkspaceDraft = {
  observation: string;
  risk: string;
  testIdea: string;
  evidence: string;
  decision: string;
};

type ModuleArtifactWorkspaceProps = {
  moduleId: string;
  moduleTitle: string;
  trackTitle: string;
  finalChallenge: string;
  skills: string[];
};

const emptyDraft: WorkspaceDraft = {
  observation: "",
  risk: "",
  testIdea: "",
  evidence: "",
  decision: "",
};

const phaseItems = [
  {
    id: "phase-1",
    title: "Фаза 1",
    label: "Собрать evidence",
    description: "Превратить уроки в рабочие заметки, риск и проверку.",
  },
  {
    id: "phase-2",
    title: "Фаза 2",
    label: "Получить AI-review",
    description: "Проверить полноту, логику и слабые места ответа.",
  },
  {
    id: "phase-3",
    title: "Фаза 3",
    label: "Сохранить в портфолио",
    description: "Зафиксировать результат как доказательство навыка.",
  },
  {
    id: "phase-4",
    title: "Фаза 4",
    label: "Закрыть модуль",
    description: "Пройти quiz или завершить модуль после доработки.",
  },
];

function buildArtifact(draft: WorkspaceDraft, moduleTitle: string, finalChallenge: string) {
  return [
    `# ${moduleTitle}: рабочий артефакт`,
    "",
    `## Задача модуля`,
    finalChallenge,
    "",
    "## Наблюдение",
    draft.observation.trim() || "Пока не заполнено.",
    "",
    "## Риск для продукта/пользователя",
    draft.risk.trim() || "Пока не заполнено.",
    "",
    "## Проверка",
    draft.testIdea.trim() || "Пока не заполнено.",
    "",
    "## Evidence",
    draft.evidence.trim() || "Пока не заполнено.",
    "",
    "## Вывод",
    draft.decision.trim() || "Пока не заполнено.",
  ].join("\n");
}

function scoreLabel(result: ReviewResult | null) {
  if (!result?.score) {
    return "нет оценки";
  }
  if (result.score >= 85) {
    return "можно в портфолио";
  }
  if (result.score >= 65) {
    return "нужна доработка";
  }
  return "вернуться к фазе 1";
}

export function ModuleArtifactWorkspace({
  moduleId,
  moduleTitle,
  trackTitle,
  finalChallenge,
  skills,
}: ModuleArtifactWorkspaceProps) {
  const storageKey = `levio:module-artifact:${moduleId}`;
  const [draft, setDraft] = useState<WorkspaceDraft>(emptyDraft);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [portfolioSaved, setPortfolioSaved] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<WorkspaceDraft> & { savedAt?: string };
      setDraft({
        observation: parsed.observation ?? "",
        risk: parsed.risk ?? "",
        testIdea: parsed.testIdea ?? "",
        evidence: parsed.evidence ?? "",
        decision: parsed.decision ?? "",
      });
      setSavedAt(parsed.savedAt ?? null);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const artifact = useMemo(() => buildArtifact(draft, moduleTitle, finalChallenge), [draft, finalChallenge, moduleTitle]);
  const filledFields = Object.values(draft).filter((value) => value.trim().length > 0).length;
  const readiness = Math.round((filledFields / Object.keys(emptyDraft).length) * 100);
  const canReview = artifact.replace(/Пока не заполнено\./g, "").trim().length > 180 && filledFields >= 3;

  function updateDraft(field: keyof WorkspaceDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setPortfolioSaved(false);
  }

  function saveDraft() {
    const timestamp = new Date().toISOString();
    window.localStorage.setItem(storageKey, JSON.stringify({ ...draft, savedAt: timestamp }));
    setSavedAt(timestamp);
  }

  function resetDraft() {
    setDraft(emptyDraft);
    setReview(null);
    setPortfolioSaved(false);
    setSavedAt(null);
    window.localStorage.removeItem(storageKey);
  }

  async function runReview() {
    setIsReviewing(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reviewType: "EXERCISE",
          payload: {
            exerciseType: "BUG_REPORT",
            submission: artifact,
            context: `${trackTitle} | ${moduleTitle} | Итоговый артефакт модуля`,
          },
        }),
      });

      const data = (await response.json()) as { result?: ReviewResult; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "AI-review временно недоступен.");
      }

      setReview(data.result ?? null);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "AI-review временно недоступен.");
    } finally {
      setIsReviewing(false);
    }
  }

  function saveToPortfolio() {
    upsertPortfolioEntry({
      id: `module-artifact-${moduleId}`,
      title: `${moduleTitle}: QA artifact`,
      description: finalChallenge,
      skillsUsed: skills.length > 0 ? skills.slice(0, 6) : ["QA analysis", "Evidence", "Test design"],
      resultSummary: review?.score
        ? `AI-review: ${review.score}/100, ${scoreLabel(review)}. ${draft.decision || draft.risk}`
        : draft.decision || artifact.slice(0, 180),
      source: "module",
      sourceRef: moduleId,
      createdAt: new Date().toISOString(),
    });
    setPortfolioSaved(true);
  }

  return (
    <section id="module-phases" className="surface-elevated border border-border/50 bg-card/45 backdrop-blur-md p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <header className="space-y-2">
            <p className="kicker text-emerald-600 dark:text-emerald-300">Фазовая работа</p>
            <div className="space-y-1">
              <h2 className="section-title">Соберите артефакт, а не просто прочитайте урок</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Модуль теперь проходит через короткий цикл: evidence, AI-review, портфолио и закрытие. Начинаем с фазы 1 прямо здесь.
              </p>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-4">
            {phaseItems.map((phase, index) => {
              const isActive = index === 0;
              const isDone = index === 1 ? Boolean(review) : index === 2 ? portfolioSaved : index === 0 ? readiness >= 60 : false;

              return (
                <article
                  key={phase.id}
                  className={cn(
                    "rounded-2xl border p-3",
                    isActive && "border-emerald-500/45 bg-emerald-500/10",
                    !isActive && "border-border/60 bg-background/45",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{phase.title}</p>
                    {isDone ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-2 w-2 rounded-full bg-border" />}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{phase.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{phase.description}</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Наблюдение</span>
              <textarea
                value={draft.observation}
                onChange={(event) => updateDraft("observation", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Что вы заметили в требованиях, UI, API, данных или поведении системы?"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Риск</span>
              <textarea
                value={draft.risk}
                onChange={(event) => updateDraft("risk", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Что может сломаться для пользователя, бизнеса или команды?"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Проверка</span>
              <textarea
                value={draft.testIdea}
                onChange={(event) => updateDraft("testIdea", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Какой тест, чеклист или сценарий докажет, что риск закрыт?"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</span>
              <textarea
                value={draft.evidence}
                onChange={(event) => updateDraft("evidence", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Какие факты, шаги, ожидаемый результат или скриншоты нужно приложить?"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Вывод</span>
            <textarea
              value={draft.decision}
              onChange={(event) => updateDraft("decision", event.target.value)}
              className="textarea-base min-h-[104px] bg-background/70"
              placeholder="Что вы рекомендуете сделать дальше: исправить, уточнить, покрыть тестами или принять риск?"
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={saveDraft} className="btn-secondary inline-flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />
              Сохранить черновик
            </button>
            <button
              type="button"
              onClick={runReview}
              disabled={!canReview || isReviewing}
              className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-55"
            >
              {isReviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isReviewing ? "Проверяю..." : "AI-review артефакта"}
            </button>
            <button
              type="button"
              onClick={saveToPortfolio}
              disabled={filledFields < 3}
              className="btn-secondary inline-flex items-center justify-center gap-2 disabled:opacity-55"
            >
              <Trophy className="h-4 w-4" />
              {portfolioSaved ? "В портфолио" : "Добавить в портфолио"}
            </button>
            <button type="button" onClick={resetDraft} className="btn-secondary inline-flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Сбросить
            </button>
          </div>

          {savedAt ? (
            <p className="text-xs text-muted-foreground">Черновик сохранён: {new Date(savedAt).toLocaleString("ru-RU")}</p>
          ) : null}
          {errorText ? <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{errorText}</p> : null}
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-border/60 bg-background/55 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="kicker">Готовность</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{readiness}%</p>
              </div>
              <ClipboardCheck className="h-9 w-9 text-emerald-500" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${readiness}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Минимум для AI-review: заполните 3 поля и дайте достаточно контекста.
            </p>
          </article>

          <article className="rounded-2xl border border-border/60 bg-background/55 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="kicker">AI verdict</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{scoreLabel(review)}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            {review ? (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-border/60 bg-card/60 p-2">
                  <p className="text-muted-foreground">Score</p>
                  <p className="text-lg font-semibold text-foreground">{review.score ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/60 p-2">
                  <p className="text-muted-foreground">Full</p>
                  <p className="text-lg font-semibold text-foreground">{review.completeness ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/60 p-2">
                  <p className="text-muted-foreground">Logic</p>
                  <p className="text-lg font-semibold text-foreground">{review.logic ?? "-"}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Оценка появится после проверки. Если AI временно недоступен, черновик и портфолио всё равно работают локально.
              </p>
            )}
          </article>

          <article className="rounded-2xl border border-border/60 bg-background/55 p-4">
            <p className="kicker">Preview</p>
            <pre className="mt-3 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-xl border border-border/60 bg-card/70 p-3 text-xs leading-5 text-muted-foreground">
              {artifact}
            </pre>
          </article>
        </aside>
      </div>
    </section>
  );
}
