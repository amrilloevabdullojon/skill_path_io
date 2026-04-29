"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, History, Inbox, Loader2, RotateCcw, Save, Sparkles, Trophy } from "lucide-react";

import { upsertPortfolioEntry } from "@/lib/portfolio/local-portfolio";
import { buildModuleShiftSeed, type ModuleShiftBrief } from "@/lib/tracks/module-brief";
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

type WorkspaceDraftField = keyof WorkspaceDraft;

type ArtifactSnippet = {
  sourceId: string;
  lessonTitle: string;
  selectedLabel: string;
  action: string;
  consequence: string;
  artifactHint: string;
  artifactField?: WorkspaceDraftField;
};

type GrowthEvent = {
  id: string;
  type: "lesson" | "starter" | "brief" | "save" | "review" | "plan" | "portfolio";
  title: string;
  detail: string;
  createdAt: string;
};

type FieldHealth = {
  field: WorkspaceDraftField;
  score: number;
  status: "empty" | "weak" | "growing" | "strong";
  label: string;
  guidance: string;
};

type ModuleArtifactWorkspaceProps = {
  moduleId: string;
  moduleTitle: string;
  trackTitle: string;
  finalChallenge: string;
  skills: string[];
  shiftBrief?: ModuleShiftBrief | null;
};

const emptyDraft: WorkspaceDraft = {
  observation: "",
  risk: "",
  testIdea: "",
  evidence: "",
  decision: "",
};

const artifactSnippetEventName = "levio:artifact-snippet";
const artifactResetEventName = "levio:artifact-reset";

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

const starterSnippets: Record<WorkspaceDraftField, Array<{ label: string; text: string }>> = {
  observation: [
    {
      label: "UI факт",
      text: "Наблюдение: пользователь видит [экран/состояние], но не получает понятного подтверждения следующего шага.",
    },
    {
      label: "API факт",
      text: "Наблюдение: запрос [endpoint/action] возвращает [status/result], но ожидаемый результат для пользователя не очевиден.",
    },
  ],
  risk: [
    {
      label: "Пользовательский риск",
      text: "Риск: пользователь может потерять прогресс или принять неверное решение, потому что система не показывает [важный сигнал].",
    },
    {
      label: "Риск релиза",
      text: "Риск: если это уйдёт в релиз без проверки, команда может получить регрессию в [критичный сценарий].",
    },
  ],
  testIdea: [
    {
      label: "Happy + edge",
      text: "Проверка: пройти happy path с валидными данными, затем повторить сценарий с граничным условием [edge case].",
    },
    {
      label: "Regression check",
      text: "Проверка: сверить новый результат с предыдущим поведением и убедиться, что связанный сценарий [scenario] не сломан.",
    },
  ],
  evidence: [
    {
      label: "Steps/result",
      text: "Evidence: шаги воспроизведения, тестовые данные, expected result, actual result и ссылка/скриншот подтверждения.",
    },
    {
      label: "Request/response",
      text: "Evidence: request payload, response status/body, timestamp и окружение, где проверка была выполнена.",
    },
  ],
  decision: [
    {
      label: "Fix",
      text: "Вывод: рекомендую исправить [что именно], затем выполнить retest по основному сценарию и одному edge case.",
    },
    {
      label: "Clarify",
      text: "Вывод: перед тестированием нужно уточнить [открытый вопрос], потому что сейчас критерий успеха неоднозначен.",
    },
  ],
};

const fieldLabels: Record<WorkspaceDraftField, string> = {
  observation: "Наблюдение",
  risk: "Риск",
  testIdea: "Проверка",
  evidence: "Evidence",
  decision: "Вывод",
};

const fieldHealthRules: Record<WorkspaceDraftField, { strongTerms: string[]; guidance: string }> = {
  observation: {
    strongTerms: ["пользователь", "ui", "api", "данн", "экран", "status", "result"],
    guidance: "Добавьте конкретный факт: экран, API, данные или наблюдаемое поведение.",
  },
  risk: {
    strongTerms: ["риск", "пользователь", "потер", "регресс", "релиз", "слом", "impact"],
    guidance: "Покажите, кому навредит проблема и что может сломаться в продукте.",
  },
  testIdea: {
    strongTerms: ["провер", "expected", "actual", "edge", "happy", "regression", "сценар"],
    guidance: "Опишите проверку как сценарий: шаг, ожидание и один edge case.",
  },
  evidence: {
    strongTerms: ["шаг", "expected", "actual", "request", "response", "скрин", "окруж", "timestamp"],
    guidance: "Добавьте доказательства: шаги, expected/actual, request/response или скриншот.",
  },
  decision: {
    strongTerms: ["исправ", "уточн", "retest", "рекоменд", "вывод", "план", "след"],
    guidance: "Закройте артефакт решением: исправить, уточнить, покрыть тестами или принять риск.",
  },
};

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

function growthStageLabel(readiness: number, review: ReviewResult | null, portfolioSaved: boolean) {
  if (portfolioSaved) {
    return "Плод в портфолио";
  }
  if (review?.score && review.score >= 85) {
    return "Спелый артефакт";
  }
  if (review) {
    return "Проверенный росток";
  }
  if (readiness >= 80) {
    return "Почти созрел";
  }
  if (readiness >= 40) {
    return "Растущая ветка";
  }
  if (readiness > 0) {
    return "Первый росток";
  }
  return "Пустая ветка";
}

function fruitClass(isReady: boolean, isReviewReady: boolean, isPortfolioReady: boolean) {
  if (isPortfolioReady) {
    return "border-amber-400/60 bg-amber-400 text-amber-950 shadow-amber-400/30";
  }
  if (isReviewReady) {
    return "border-emerald-400/60 bg-emerald-500 text-white shadow-emerald-500/25";
  }
  if (isReady) {
    return "border-sky-400/60 bg-sky-500 text-white shadow-sky-500/20";
  }
  return "border-border/70 bg-muted text-muted-foreground";
}

function growthEventClass(type: GrowthEvent["type"]) {
  if (type === "portfolio") {
    return "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  if (type === "review" || type === "plan") {
    return "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
  if (type === "lesson" || type === "starter" || type === "brief") {
    return "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  return "border-border/60 bg-card/60 text-muted-foreground";
}

function calculateFieldHealth(field: WorkspaceDraftField, value: string): FieldHealth {
  const normalized = value.trim().toLowerCase();
  const rules = fieldHealthRules[field];
  const matchedTerms = rules.strongTerms.filter((term) => normalized.includes(term)).length;
  const lengthScore = Math.min(55, Math.floor(normalized.length / 2.8));
  const signalScore = Math.min(45, matchedTerms * 12);
  const score = normalized.length === 0 ? 0 : Math.min(100, lengthScore + signalScore);
  const status: FieldHealth["status"] =
    score >= 78 ? "strong" : score >= 45 ? "growing" : score > 0 ? "weak" : "empty";

  return {
    field,
    score,
    status,
    label: fieldLabels[field],
    guidance: status === "strong" ? "Ветка выглядит зрелой. Можно связывать её с AI-review." : rules.guidance,
  };
}

function fieldHealthClass(status: FieldHealth["status"]) {
  if (status === "strong") {
    return "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (status === "growing") {
    return "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
  if (status === "weak") {
    return "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-border/60 bg-card/55 text-muted-foreground";
}

function fieldHealthStatusLabel(status: FieldHealth["status"]) {
  if (status === "strong") {
    return "зрелая";
  }
  if (status === "growing") {
    return "растёт";
  }
  if (status === "weak") {
    return "слабая";
  }
  return "пустая";
}

function snippetFocusField(snippet: ArtifactSnippet): WorkspaceDraftField {
  if (snippet.artifactField && snippet.artifactField in emptyDraft) {
    return snippet.artifactField;
  }

  const text = `${snippet.selectedLabel} ${snippet.action} ${snippet.consequence} ${snippet.artifactHint}`.toLowerCase();
  if (text.includes("question") || text.includes("уточ") || text.includes("clarify") || text.includes("open question")) {
    return "decision";
  }
  if (text.includes("evidence") || text.includes("actual") || text.includes("request") || text.includes("response") || text.includes("steps")) {
    return "evidence";
  }
  if (text.includes("scenario") || text.includes("сценар") || text.includes("check") || text.includes("провер")) {
    return "testIdea";
  }
  if (text.includes("risk") || text.includes("риск")) {
    return "risk";
  }
  return "observation";
}

function snippetFocusGuidance(snippet: ArtifactSnippet) {
  const field = snippetFocusField(snippet);
  if (field === "decision") {
    return "Вы выбрали путь уточнения. Закройте его решением: какой вопрос открыт и как ответ изменит проверку.";
  }
  if (field === "evidence") {
    return "Вы выбрали путь проверки. Добавьте доказательство: steps, test data, expected/actual или request/response.";
  }
  if (field === "testIdea") {
    return "Вы выбрали путь сценария. Сформулируйте проверку так, чтобы она доказывала или опровергала риск.";
  }
  if (field === "risk") {
    return "Вы выбрали путь риска. Усильте формулировку: кому навредит проблема и что может сломаться.";
  }
  return "Начните с наблюдения: какой факт из урока вы увидели и почему он важен для проверки.";
}

function fieldMicroTask(field: WorkspaceDraftField, snippet: ArtifactSnippet | null) {
  const context = snippet ? `по ходу "${snippet.selectedLabel}"` : "по текущему модулю";
  if (field === "observation") {
    return {
      title: "Зафиксируйте факт",
      prompt: `Напишите одно наблюдение ${context}: что пользователь делает, что система показывает и где возникает сигнал для QA.`,
      starter: snippet
        ? `[${snippet.lessonTitle}] Наблюдение: выбран ход "${snippet.selectedLabel}". ${snippet.action}`
        : "Наблюдение: пользователь выполняет [действие], система показывает [результат], но остаётся неясным [сигнал/условие].",
    };
  }
  if (field === "risk") {
    return {
      title: "Назовите риск",
      prompt: `Опишите риск ${context}: кому навредит проблема, что может сломаться и почему это важно до релиза.`,
      starter: snippet
        ? `Риск: ${snippet.consequence}`
        : "Риск: пользователь может столкнуться с [проблема], из-за чего [последствие для пользователя/бизнеса].",
    };
  }
  if (field === "testIdea") {
    return {
      title: "Соберите проверку",
      prompt: `Сформулируйте короткую проверку ${context}: шаг, expected result и один edge case.`,
      starter: snippet
        ? `Проверка: ${snippet.artifactHint}`
        : "Проверка: выполнить [шаги], ожидать [expected result], затем повторить с edge case [условие].",
    };
  }
  if (field === "evidence") {
    return {
      title: "Добавьте evidence",
      prompt: `Укажите доказательство ${context}: steps, test data, expected/actual, screenshot или request/response.`,
      starter: snippet
        ? `Evidence: для хода "${snippet.selectedLabel}" приложить steps, test data, expected/actual и подтверждение результата.`
        : "Evidence: steps, test data, expected result, actual result, окружение и screenshot/request-response.",
    };
  }
  return {
    title: "Закройте решением",
    prompt: `Сделайте вывод ${context}: исправить, уточнить, покрыть тестом или принять риск.`,
    starter: snippet
      ? `Вывод: продолжить через "${snippet.selectedLabel}" и проверить результат в итоговом артефакте.`
      : "Вывод: рекомендую [действие], потому что [обоснование]. Следующий шаг: [retest/clarify/fix/accept risk].",
  };
}

function appendUnique(current: string, next: string) {
  const trimmedNext = next.trim();
  if (!trimmedNext) {
    return current;
  }
  if (current.includes(trimmedNext)) {
    return current;
  }
  return current.trim().length > 0 ? `${current.trim()}\n\n${trimmedNext}` : trimmedNext;
}

function applySnippetToDraft(current: WorkspaceDraft, snippet: ArtifactSnippet): WorkspaceDraft {
  return {
    observation: appendUnique(
      current.observation,
      `[${snippet.lessonTitle}] Выбранный ход: ${snippet.selectedLabel}. ${snippet.action}`,
    ),
    risk: appendUnique(current.risk, snippet.consequence),
    testIdea: appendUnique(current.testIdea, snippet.artifactHint),
    evidence: current.evidence,
    decision: appendUnique(current.decision, `Продолжить через "${snippet.selectedLabel}" и проверить результат в итоговом артефакте.`),
  };
}

export function ModuleArtifactWorkspace({
  moduleId,
  moduleTitle,
  trackTitle,
  finalChallenge,
  skills,
  shiftBrief,
}: ModuleArtifactWorkspaceProps) {
  const storageKey = `levio:module-artifact:${moduleId}`;
  const growthEventsStorageKey = `${storageKey}:growth-events`;
  const fieldRefs = useRef<Record<WorkspaceDraftField, HTMLTextAreaElement | null>>({
    observation: null,
    risk: null,
    testIdea: null,
    evidence: null,
    decision: null,
  });
  const [draft, setDraft] = useState<WorkspaceDraft>(emptyDraft);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [portfolioSaved, setPortfolioSaved] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [importedSnippet, setImportedSnippet] = useState<ArtifactSnippet | null>(null);
  const [reviewPlanApplied, setReviewPlanApplied] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [growthEvents, setGrowthEvents] = useState<GrowthEvent[]>([]);

  const addGrowthEvent = useCallback((event: Omit<GrowthEvent, "id" | "createdAt">) => {
    const nextEvent: GrowthEvent = {
      ...event,
      id: `${Date.now()}-${event.type}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
    };

    setGrowthEvents((current) => {
      const nextEvents = [nextEvent, ...current].slice(0, 8);
      window.localStorage.setItem(growthEventsStorageKey, JSON.stringify(nextEvents));
      return nextEvents;
    });
  }, [growthEventsStorageKey]);

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

  useEffect(() => {
    const raw = window.localStorage.getItem(growthEventsStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as GrowthEvent[];
      setGrowthEvents(Array.isArray(parsed) ? parsed.slice(0, 8) : []);
    } catch {
      window.localStorage.removeItem(growthEventsStorageKey);
    }
  }, [growthEventsStorageKey]);

  useEffect(() => {
    function handleSnippet(event: Event) {
      const snippet = (event as CustomEvent<ArtifactSnippet>).detail;
      if (!snippet?.sourceId || !snippet.lessonTitle) {
        return;
      }

      setDraft((current) => {
        const nextDraft = applySnippetToDraft(current, snippet);
        const timestamp = new Date().toISOString();
        window.localStorage.setItem(storageKey, JSON.stringify({ ...nextDraft, savedAt: timestamp }));
        setSavedAt(timestamp);
        return nextDraft;
      });
      setImportedSnippet(snippet);
      setPortfolioSaved(false);
      addGrowthEvent({
        type: "lesson",
        title: "Рост из урока",
        detail: `${snippet.lessonTitle}: ${snippet.selectedLabel}`,
      });
      window.location.hash = "module-phases";
    }

    window.addEventListener(artifactSnippetEventName, handleSnippet);
    return () => window.removeEventListener(artifactSnippetEventName, handleSnippet);
  }, [addGrowthEvent, storageKey]);

  const artifact = useMemo(() => buildArtifact(draft, moduleTitle, finalChallenge), [draft, finalChallenge, moduleTitle]);
  const filledFields = Object.values(draft).filter((value) => value.trim().length > 0).length;
  const readiness = Math.round((filledFields / Object.keys(emptyDraft).length) * 100);
  const canReview = artifact.replace(/Пока не заполнено\./g, "").trim().length > 180 && filledFields >= 3;
  const reviewReady = Boolean(review);
  const strongReview = Boolean(review?.score && review.score >= 85);
  const growthLabel = growthStageLabel(readiness, review, portfolioSaved);
  const fieldHealth = (Object.keys(emptyDraft) as WorkspaceDraftField[]).map((field) => calculateFieldHealth(field, draft[field]));
  const artifactHealth = Math.round(fieldHealth.reduce((sum, item) => sum + item.score, 0) / fieldHealth.length);
  const weakestField = fieldHealth.find((item) => item.status !== "strong") ?? null;
  const decisionFocusField = importedSnippet ? snippetFocusField(importedSnippet) : null;
  const decisionFocusHealth = decisionFocusField ? fieldHealth.find((item) => item.field === decisionFocusField) ?? null : null;
  const guidedField = decisionFocusHealth && decisionFocusHealth.status !== "strong" ? decisionFocusHealth : weakestField;
  const guidedFieldReason = importedSnippet && guidedField?.field === decisionFocusField
    ? snippetFocusGuidance(importedSnippet)
    : guidedField?.guidance;
  const growthMilestones = [
    {
      id: "observation",
      field: "observation" as const,
      label: "Наблюдение",
      done: draft.observation.trim().length > 0,
      prompt: "Начните с факта: что именно вы увидели в задаче, UI, API или данных.",
    },
    {
      id: "risk",
      field: "risk" as const,
      label: "Риск",
      done: draft.risk.trim().length > 0,
      prompt: "Опишите, кому и чем навредит проблема, если её пропустить.",
    },
    {
      id: "test",
      field: "testIdea" as const,
      label: "Проверка",
      done: draft.testIdea.trim().length > 0,
      prompt: "Сформулируйте один сценарий, который докажет или опровергнет риск.",
    },
    {
      id: "evidence",
      field: "evidence" as const,
      label: "Evidence",
      done: draft.evidence.trim().length > 0,
      prompt: "Укажите, какие шаги, данные, screenshot, request или expected result приложите.",
    },
    {
      id: "decision",
      field: "decision" as const,
      label: "Вывод",
      done: draft.decision.trim().length > 0,
      prompt: "Закройте работу решением: исправить, уточнить, покрыть тестами или принять риск.",
    },
  ];
  const nextGrowthMilestone = growthMilestones.find((milestone) => !milestone.done) ?? null;
  const activeMicroTask = fieldMicroTask(guidedField?.field ?? nextGrowthMilestone?.field ?? "observation", importedSnippet);

  function updateDraft(field: keyof WorkspaceDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setPortfolioSaved(false);
  }

  function insertStarter(field: WorkspaceDraftField, label: string, text: string) {
    setDraft((current) => ({
      ...current,
      [field]: appendUnique(current[field], text),
    }));
    setPortfolioSaved(false);
    setReviewPlanApplied(false);
    addGrowthEvent({
      type: "starter",
      title: "Подсказка стала заготовкой",
      detail: `${label} → ${fieldLabels[field]}`,
    });
    window.setTimeout(() => focusField(field), 50);
  }

  function plantShiftBrief() {
    if (!shiftBrief) {
      return;
    }

    const seed = buildModuleShiftSeed(shiftBrief);
    setDraft((current) => {
      const nextDraft: WorkspaceDraft = {
        ...current,
        observation: appendUnique(current.observation, seed.observation),
        risk: appendUnique(current.risk, seed.risk),
        testIdea: appendUnique(current.testIdea, seed.testIdea),
        decision: appendUnique(current.decision, seed.decision),
      };
      const timestamp = new Date().toISOString();
      window.localStorage.setItem(storageKey, JSON.stringify({ ...nextDraft, savedAt: timestamp }));
      setSavedAt(timestamp);
      return nextDraft;
    });
    setPortfolioSaved(false);
    setReviewPlanApplied(false);
    addGrowthEvent({
      type: "brief",
      title: "Бриф посажен в артефакт",
      detail: "Сцена, риск, маршрут и итог смены добавлены как стартовые ветки",
    });
    window.setTimeout(() => focusField("observation"), 50);
  }

  function renderStarters(field: WorkspaceDraftField) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {starterSnippets[field].map((snippet) => (
          <button
            key={snippet.label}
            type="button"
            onClick={() => insertStarter(field, snippet.label, snippet.text)}
            className="rounded-full border border-border/60 bg-card/55 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-foreground"
          >
            + {snippet.label}
          </button>
        ))}
      </div>
    );
  }

  function saveDraft() {
    const timestamp = new Date().toISOString();
    window.localStorage.setItem(storageKey, JSON.stringify({ ...draft, savedAt: timestamp }));
    setSavedAt(timestamp);
    addGrowthEvent({
      type: "save",
      title: "Черновик закреплён",
      detail: `${filledFields} из 5 частей артефакта заполнены`,
    });
  }

  function resetDraft() {
    setDraft(emptyDraft);
    setReview(null);
    setErrorText(null);
    setImportedSnippet(null);
    setReviewPlanApplied(false);
    setPortfolioSaved(false);
    setSavedAt(null);
    setGrowthEvents([]);
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(growthEventsStorageKey);
    window.dispatchEvent(new CustomEvent(artifactResetEventName));
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
      setReviewPlanApplied(false);
      addGrowthEvent({
        type: "review",
        title: "AI-review проверил зрелость",
        detail: data.result?.score ? `Оценка ${data.result.score}/100, ${scoreLabel(data.result)}` : "Оценка получена",
      });
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
    addGrowthEvent({
      type: "portfolio",
      title: "Плод добавлен в портфолио",
      detail: review?.score ? `Сохранено с AI-review ${review.score}/100` : "Сохранено как локальный QA artifact",
    });
  }

  function applyReviewPlan() {
    if (!review) {
      return;
    }

    const feedback = review.feedback?.filter(Boolean) ?? [];
    const nextSteps = review.nextSteps?.filter(Boolean) ?? [];
    const reviewSummary = [
      `AI-review: ${review.score ?? "-"} / 100`,
      feedback.length > 0 ? `Feedback:\n${feedback.map((item) => `- ${item}`).join("\n")}` : "",
      nextSteps.length > 0 ? `Next steps:\n${nextSteps.map((item) => `- ${item}`).join("\n")}` : "",
    ].filter(Boolean).join("\n\n");

    setDraft((current) => {
      const nextDraft: WorkspaceDraft = {
        ...current,
        evidence: appendUnique(current.evidence, reviewSummary),
        decision: appendUnique(
          current.decision,
          nextSteps.length > 0
            ? `План доработки после AI-review:\n${nextSteps.map((item) => `- ${item}`).join("\n")}`
            : "План доработки после AI-review: уточнить evidence, риск и итоговое решение.",
        ),
      };
      const timestamp = new Date().toISOString();
      window.localStorage.setItem(storageKey, JSON.stringify({ ...nextDraft, savedAt: timestamp }));
      setSavedAt(timestamp);
      return nextDraft;
    });
    setReviewPlanApplied(true);
    setPortfolioSaved(false);
    addGrowthEvent({
      type: "plan",
      title: "План доработки встроен",
      detail: nextSteps.length > 0 ? `${nextSteps.length} следующих шага добавлены в вывод` : "Добавлен базовый план улучшения",
    });
    focusField("decision");
  }

  function focusField(field: WorkspaceDraftField) {
    const element = fieldRefs.current[field];
    if (!element) {
      return;
    }
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => element.focus(), 250);
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

          {shiftBrief ? (
            <article className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Seed из брифа смены</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Посадите сцену, ставки и маршрут модуля в артефакт, чтобы не начинать с пустого листа.
                  </p>
                </div>
                <button type="button" onClick={plantShiftBrief} className="btn-secondary inline-flex shrink-0 items-center justify-center gap-2 text-xs">
                  Посадить seed
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ) : null}

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
                ref={(node) => {
                  fieldRefs.current.observation = node;
                }}
                value={draft.observation}
                onChange={(event) => updateDraft("observation", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Что вы заметили в требованиях, UI, API, данных или поведении системы?"
              />
              {renderStarters("observation")}
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Риск</span>
              <textarea
                ref={(node) => {
                  fieldRefs.current.risk = node;
                }}
                value={draft.risk}
                onChange={(event) => updateDraft("risk", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Что может сломаться для пользователя, бизнеса или команды?"
              />
              {renderStarters("risk")}
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Проверка</span>
              <textarea
                ref={(node) => {
                  fieldRefs.current.testIdea = node;
                }}
                value={draft.testIdea}
                onChange={(event) => updateDraft("testIdea", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Какой тест, чеклист или сценарий докажет, что риск закрыт?"
              />
              {renderStarters("testIdea")}
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</span>
              <textarea
                ref={(node) => {
                  fieldRefs.current.evidence = node;
                }}
                value={draft.evidence}
                onChange={(event) => updateDraft("evidence", event.target.value)}
                className="textarea-base min-h-[112px] bg-background/70"
                placeholder="Какие факты, шаги, ожидаемый результат или скриншоты нужно приложить?"
              />
              {renderStarters("evidence")}
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Вывод</span>
            <textarea
              ref={(node) => {
                fieldRefs.current.decision = node;
              }}
              value={draft.decision}
              onChange={(event) => updateDraft("decision", event.target.value)}
              className="textarea-base min-h-[104px] bg-background/70"
              placeholder="Что вы рекомендуете сделать дальше: исправить, уточнить, покрыть тестами или принять риск?"
            />
            {renderStarters("decision")}
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
          {importedSnippet ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              <p className="inline-flex items-center gap-2 font-semibold">
                <Inbox className="h-4 w-4" />
                След выбора: {importedSnippet.lessonTitle}
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <p className="rounded-xl border border-emerald-500/25 bg-background/45 px-3 py-2 text-xs leading-5 text-muted-foreground">
                  Ход: <span className="font-semibold text-foreground">{importedSnippet.selectedLabel}</span>
                </p>
                {decisionFocusField ? (
                  <button
                    type="button"
                    onClick={() => focusField(decisionFocusField)}
                    className="rounded-xl border border-emerald-500/25 bg-background/45 px-3 py-2 text-left text-xs leading-5 text-muted-foreground transition-colors hover:border-emerald-500/45 hover:text-foreground"
                  >
                    Следующий фокус: <span className="font-semibold text-foreground">{fieldLabels[decisionFocusField]}</span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          {errorText ? <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">{errorText}</p> : null}
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker text-emerald-700 dark:text-emerald-300">Задание на сейчас</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{activeMicroTask.title}</p>
              </div>
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{activeMicroTask.prompt}</p>
            <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-background/45 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Можно вставить</p>
              <p className="mt-1 text-xs leading-5 text-foreground/80">{activeMicroTask.starter}</p>
            </div>
            <button
              type="button"
              onClick={() => insertStarter(guidedField?.field ?? nextGrowthMilestone?.field ?? "observation", activeMicroTask.title, activeMicroTask.starter)}
              className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 text-xs"
            >
              Вставить и доработать
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </article>

          <article className="rounded-2xl border border-border/60 bg-background/55 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker">Здоровье веток</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Качество артефакта до AI-review</p>
              </div>
              <span className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                {artifactHealth}%
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {fieldHealth.map((item) => (
                <button
                  key={item.field}
                  type="button"
                  onClick={() => focusField(item.field)}
                  className={cn("w-full rounded-2xl border px-3 py-2 text-left transition-colors hover:border-emerald-500/45", fieldHealthClass(item.status))}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide">{fieldHealthStatusLabel(item.status)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/70">
                    <div className="h-full rounded-full bg-current transition-all" style={{ width: `${item.score}%` }} />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-border/60 bg-card/55 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Что усилить</p>
              {guidedField ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-foreground">{guidedField.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{guidedFieldReason}</p>
                  <button
                    type="button"
                    onClick={() => focusField(guidedField.field)}
                    className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 text-xs"
                  >
                    Усилить ветку
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Все ветки достаточно зрелые. Следующий логичный шаг - AI-review и сохранение результата.
                </p>
              )}
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-background/55 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker">Дерево артефакта</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{growthLabel}</p>
              </div>
              <span className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                {readiness}%
              </span>
            </div>

            <div className="relative mt-5 h-56 overflow-hidden rounded-2xl border border-border/60 bg-card/45">
              <div className="absolute inset-x-0 bottom-0 h-14 bg-emerald-500/8" />
              <div className="absolute bottom-9 left-1/2 h-28 w-3 -translate-x-1/2 rounded-full bg-emerald-900/35 dark:bg-emerald-400/25" />
              <div
                className="absolute bottom-9 left-1/2 w-3 -translate-x-1/2 rounded-full bg-emerald-500 transition-all duration-500"
                style={{ height: `${Math.max(22, readiness)}%` }}
              />

              <div className="absolute bottom-28 left-1/2 h-2 w-24 origin-left -rotate-[28deg] rounded-full bg-emerald-500/60" />
              <div className="absolute bottom-32 right-1/2 h-2 w-24 origin-right rotate-[28deg] rounded-full bg-emerald-500/60" />
              <div className="absolute bottom-20 left-1/2 h-2 w-20 origin-left rotate-[18deg] rounded-full bg-emerald-500/45" />
              <div className="absolute bottom-24 right-1/2 h-2 w-20 origin-right -rotate-[18deg] rounded-full bg-emerald-500/45" />

              {growthMilestones.map((milestone, index) => {
                const positions = [
                  "left-[18%] top-[28%]",
                  "right-[18%] top-[24%]",
                  "left-[24%] top-[55%]",
                  "right-[25%] top-[52%]",
                  "left-1/2 top-[14%] -translate-x-1/2",
                ];

                return (
                  <button
                    key={milestone.id}
                    type="button"
                    onClick={() => focusField(milestone.field)}
                    className={cn(
                      "absolute inline-flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold shadow-lg transition-all",
                      positions[index],
                      "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                      fruitClass(milestone.done, reviewReady, portfolioSaved),
                    )}
                    title={milestone.label}
                  >
                    {index + 1}
                  </button>
                );
              })}

              <span
                className={cn(
                  "absolute bottom-8 right-8 inline-flex h-11 w-11 items-center justify-center rounded-full border text-xs font-bold shadow-lg transition-all",
                  fruitClass(strongReview, strongReview, portfolioSaved),
                )}
                title="AI-review и портфолио"
              >
                {portfolioSaved ? "P" : reviewReady ? "AI" : "Q"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {growthMilestones.map((milestone) => (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => focusField(milestone.field)}
                  className={cn(
                    "rounded-xl border px-2 py-1.5 text-left transition-colors hover:border-emerald-500/40",
                    milestone.done
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border/60 bg-card/55 text-muted-foreground",
                  )}
                >
                  {milestone.done ? "✓ " : ""}
                  {milestone.label}
                </button>
              ))}
              <p
                className={cn(
                  "rounded-xl border px-2 py-1.5",
                  reviewReady
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                    : "border-border/60 bg-card/55 text-muted-foreground",
                )}
              >
                {reviewReady ? "✓ " : ""}
                AI-review
              </p>
            </div>
            <div className="mt-3 rounded-2xl border border-border/60 bg-card/55 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Следующий рост</p>
              {nextGrowthMilestone ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-foreground">{nextGrowthMilestone.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{nextGrowthMilestone.prompt}</p>
                  <button
                    type="button"
                    onClick={() => focusField(nextGrowthMilestone.field)}
                    className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 text-xs"
                  >
                    Перейти к полю
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : !reviewReady ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-foreground">Проверить зрелость</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Все плоды заполнены. Запустите AI-review, чтобы увидеть, насколько артефакт готов к портфолио.
                  </p>
                  <button
                    type="button"
                    onClick={runReview}
                    disabled={!canReview || isReviewing}
                    className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 text-xs disabled:opacity-55"
                  >
                    {isReviewing ? "Проверяю..." : "Запустить AI-review"}
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : !portfolioSaved ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-foreground">Закрепить результат</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Артефакт проверен. Сохраните его в портфолио, чтобы плод стал финальным доказательством навыка.
                  </p>
                  <button
                    type="button"
                    onClick={saveToPortfolio}
                    className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 text-xs"
                  >
                    Добавить в портфолио
                    <Trophy className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Артефакт сохранён. Можно закрывать модуль или переходить к следующей ветке обучения.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-border/60 bg-background/55 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="kicker">Кольца роста</p>
                <p className="mt-1 text-sm font-semibold text-foreground">История развития артефакта</p>
              </div>
              <History className="h-5 w-5 text-emerald-500" />
            </div>
            {growthEvents.length > 0 ? (
              <ol className="mt-3 space-y-2">
                {growthEvents.slice(0, 5).map((event) => (
                  <li key={event.id} className={cn("rounded-2xl border px-3 py-2", growthEventClass(event.type))}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <time className="shrink-0 text-[11px] text-muted-foreground">
                        {new Date(event.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{event.detail}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-border/70 bg-card/45 p-3 text-xs leading-5 text-muted-foreground">
                Первое кольцо появится, когда вы перенесёте выбор из урока, используете заготовку или сохраните черновик.
              </p>
            )}
          </article>

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
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
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
                {(review.feedback?.length || review.nextSteps?.length) ? (
                  <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                      План доработки
                    </p>
                    {review.feedback?.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
                        {review.feedback.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {review.nextSteps?.length ? (
                      <div className="mt-2 space-y-1">
                        {review.nextSteps.slice(0, 3).map((item) => (
                          <p key={item} className="rounded-xl border border-border/50 bg-card/55 px-2 py-1.5 text-xs text-foreground/80">
                            {item}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={applyReviewPlan}
                      className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 text-xs"
                    >
                      {reviewPlanApplied ? "План добавлен" : "Добавить план в черновик"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}
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
