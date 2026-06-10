"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Crosshair,
  FileText,
  Filter,
  Loader2,
  MessageSquare,
  NotebookPen,
  PencilLine,
  RefreshCw,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/empty-state";
import { useBrowserStorageItem } from "@/hooks/use-browser-storage";
import { useIsClient } from "@/hooks/use-is-client";
import { upsertPortfolioEntry } from "@/lib/portfolio/local-portfolio";
import type { LearningMission, MissionEvaluation } from "@/types/personalization";
import { cn } from "@/lib/utils";

type MissionBoardProps = {
  missions: LearningMission[];
  isPlanLimited?: boolean;
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type PracticeState = "new" | "draft" | "submitted" | "needs_revision" | "portfolio_ready";
type MissionFilter = "all" | LearningMission["category"];

const stateCopy: Record<PracticeState, { label: string; tone: string }> = {
  new: {
    label: "Новая миссия",
    tone: "border-sky-400/35 bg-sky-500/10 text-sky-200",
  },
  draft: {
    label: "Черновик",
    tone: "border-amber-400/35 bg-amber-500/10 text-amber-200",
  },
  submitted: {
    label: "Отправлено",
    tone: "border-indigo-400/35 bg-indigo-500/10 text-indigo-200",
  },
  needs_revision: {
    label: "Нужно исправить",
    tone: "border-rose-400/35 bg-rose-500/10 text-rose-200",
  },
  portfolio_ready: {
    label: "Готово к портфолио",
    tone: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
  },
};

function missionTone(category: LearningMission["category"]) {
  if (category === "QA") return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
  if (category === "BA") return "border-orange-400/35 bg-orange-500/10 text-orange-200";
  return "border-violet-400/35 bg-violet-500/10 text-violet-200";
}

function buildStarterMessage(mission: LearningMission) {
  return `Я сейчас в роли: ${mission.roleContext}. Дайте мне короткий первый вопрос по задаче, и я отвечу как реальный стейкхолдер.`;
}

function portfolioSummary(mission: LearningMission, draft: string, evaluation: MissionEvaluation) {
  const shortDraft = draft.trim().replace(/\s+/g, " ").slice(0, 220);

  return [
    `Практическая миссия: ${mission.title}.`,
    `Оценка: ${evaluation.score}% (${evaluation.verdict}).`,
    shortDraft ? `Итоговый артефакт: ${shortDraft}${draft.length > 220 ? "..." : ""}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

const missionFilters: Array<{ label: string; value: MissionFilter }> = [
  { label: "Все", value: "all" },
  { label: "QA", value: "QA" },
  { label: "BA", value: "BA" },
  { label: "Data", value: "DA" },
];

export function MissionBoard({ missions, isPlanLimited = false }: MissionBoardProps) {
  const t = useTranslations("missionsPage.board");
  const [activeId, setActiveId] = useState(missions[0]?.id ?? "");
  const [activeFilter, setActiveFilter] = useState<MissionFilter>("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, MissionEvaluation | undefined>>({});
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);
  const [messagesByMission, setMessagesByMission] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const hasMounted = useIsClient();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  const activeMission = useMemo(
    () => missions.find((mission) => mission.id === activeId) ?? missions[0] ?? null,
    [activeId, missions],
  );
  const visibleMissions = useMemo(
    () => missions.filter((mission) => activeFilter === "all" || mission.category === activeFilter),
    [activeFilter, missions],
  );
  const categoryCounts = useMemo(
    () => ({
      QA: missions.filter((mission) => mission.category === "QA").length,
      BA: missions.filter((mission) => mission.category === "BA").length,
      DA: missions.filter((mission) => mission.category === "DA").length,
    }),
    [missions],
  );

  const activeDraftStorageKey = activeMission ? `levio:mission-draft:${activeMission.id}` : "levio:mission-draft:none";
  const storedActiveDraft = useBrowserStorageItem("local", activeDraftStorageKey);
  const activeDraft = activeMission ? drafts[activeMission.id] ?? storedActiveDraft ?? "" : "";
  const activeEvaluation = activeMission ? evaluations[activeMission.id] ?? null : null;
  const activePortfolioId = activeMission ? `mission-${activeMission.id}` : null;
  const starterMessages = useMemo(
    () => (activeMission ? [{ id: "ai-initial", role: "ai" as const, text: buildStarterMessage(activeMission) }] : []),
    [activeMission],
  );
  const messages = useMemo(
    () => (activeMission ? messagesByMission[activeMission.id] ?? starterMessages : []),
    [activeMission, messagesByMission, starterMessages],
  );

  const setActiveMessages = useCallback(
    (next: ChatMessage[] | ((current: ChatMessage[]) => ChatMessage[])) => {
      if (!activeMission) return;
      setMessagesByMission((current) => {
        const currentMessages = current[activeMission.id] ?? starterMessages;
        return {
          ...current,
          [activeMission.id]: typeof next === "function" ? next(currentMessages) : next,
        };
      });
    },
    [activeMission, starterMessages],
  );

  const practiceState: PracticeState = useMemo(() => {
    if (!activeMission) return "new";
    if (savedPortfolioId === activePortfolioId) return "portfolio_ready";
    if (activeEvaluation) return activeEvaluation.score >= 65 ? "submitted" : "needs_revision";
    if (activeDraft.trim().length > 0 || messages.some((message) => message.role === "user")) return "draft";
    return "new";
  }, [activeDraft, activeEvaluation, activeMission, activePortfolioId, messages, savedPortfolioId]);

  const userMessageCount = messages.filter((message) => message.role === "user").length;
  const canSubmit = activeDraft.trim().length >= 60 || userMessageCount >= 2;

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isAiTyping]);

  function updateDraft(value: string) {
    if (!activeMission) return;

    setDrafts((current) => ({ ...current, [activeMission.id]: value }));
    setEvaluations((current) => ({ ...current, [activeMission.id]: undefined }));
    setSavedPortfolioId((current) => (current === `mission-${activeMission.id}` ? null : current));
    if (hasMounted) {
      window.localStorage.setItem(`levio:mission-draft:${activeMission.id}`, value);
    }
  }

  async function handleSendMessage(event?: React.FormEvent) {
    event?.preventDefault();
    if (!activeMission || !chatInput.trim() || isAiTyping) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: chatInput.trim(),
    };
    const nextMessages = [...messages, userMessage];

    setActiveMessages(nextMessages);
    setChatInput("");
    setIsAiTyping(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai/mission-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mission: activeMission, history: nextMessages }),
      });

      const data = (await response.json()) as { text?: unknown; error?: unknown; message?: unknown };
      if (!response.ok || typeof data.text !== "string" || data.text.length === 0) {
        const errorMessage =
          typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : t("chatError");
        throw new Error(errorMessage);
      }

      const aiText = data.text;
      setActiveMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "ai", text: aiText },
      ]);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : t("retryError"));
    } finally {
      setIsAiTyping(false);
    }
  }

  async function submitMission() {
    if (!activeMission) return;

    const transcript = messages.map((message) => `${message.role.toUpperCase()}: ${message.text}`).join("\n");
    const submission = [
      `MISSION: ${activeMission.title}`,
      `OBJECTIVE: ${activeMission.objective}`,
      `WORK ARTIFACT:\n${activeDraft.trim()}`,
      transcript ? `STAKEHOLDER CHAT:\n${transcript}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!canSubmit) {
      setErrorText("Добавьте рабочий артефакт или задайте минимум два уточняющих вопроса стейкхолдеру.");
      draftRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/missions/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mission: activeMission, submission }),
      });

      const data = (await response.json()) as { evaluation?: MissionEvaluation; error?: string };
      if (!response.ok || !data.evaluation) {
        throw new Error(data.error || "Mission evaluation failed");
      }

      setEvaluations((current) => ({ ...current, [activeMission.id]: data.evaluation }));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Mission evaluation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function saveToPortfolio() {
    if (!activeMission || !activeEvaluation) return;

    const entryId = `mission-${activeMission.id}`;
    upsertPortfolioEntry({
      id: entryId,
      title: activeMission.title,
      description: activeMission.scenario,
      skillsUsed: activeMission.skillsUsed,
      resultSummary: portfolioSummary(activeMission, activeDraft, activeEvaluation),
      source: "mission",
      sourceRef: activeMission.id,
      createdAt: new Date().toISOString(),
    });
    setSavedPortfolioId(entryId);
  }

  function reviseMission() {
    if (!activeMission) return;

    setEvaluations((current) => ({ ...current, [activeMission.id]: undefined }));
    setErrorText(null);
    requestAnimationFrame(() => draftRef.current?.focus());
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-4 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="kicker">{t("kicker")}</p>
            <h1 className="page-title leading-tight">{t("title")}</h1>
            <p className="section-description">{t("description")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-[360px]">
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <p className="text-lg font-semibold text-foreground">{missions.length}</p>
              <p className="text-muted-foreground">миссий</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <p className="text-lg font-semibold text-foreground">
                {missions.reduce((sum, mission) => sum + mission.xpReward, 0)}
              </p>
              <p className="text-muted-foreground">XP</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <p className="text-lg font-semibold text-foreground">
                {Object.values(evaluations).filter(Boolean).length}
              </p>
              <p className="text-muted-foreground">сдано</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/notes" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Источник</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Взять идею из заметок
              <NotebookPen className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/bookmarks" className="rounded-xl border border-border bg-background/60 p-3 transition-colors hover:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Материалы</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Открыть закладки
              <Bookmark className="h-4 w-4" />
            </p>
          </Link>
          <Link href="/review" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 transition-colors hover:bg-indigo-500/15">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">После проверки</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              Вернуться к слабым вопросам
              <ArrowRight className="h-4 w-4" />
            </p>
          </Link>
        </div>

        {isPlanLimited ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-2">
            <p className="text-xs text-amber-100">{t("upgrade.message")}</p>
            <Link href="/billing" className="btn-primary shrink-0 px-3 py-1.5 text-xs">
              {t("upgrade.button")}
            </Link>
          </div>
        ) : null}
      </header>

      {missions.length === 0 ? (
        <EmptyState
          icon={Crosshair}
          title={t("empty.title")}
          description={t("empty.description")}
          actionLabel={t("empty.action")}
          actionHref="/tracks"
        />
      ) : null}

      {activeMission ? (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="surface-elevated h-fit space-y-3 p-4" aria-label={t("availableMissions")}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">{t("availableMissions")}</h2>
              <span className="text-xs text-muted-foreground">{visibleMissions.length} из {missions.length}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {missionFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFilter(option.value)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    activeFilter === option.value
                      ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                      : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
              <div className="rounded-lg border border-border bg-background/60 p-2">
                <p className="font-semibold text-foreground">{categoryCounts.QA}</p>
                <p>QA</p>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-2">
                <p className="font-semibold text-foreground">{categoryCounts.BA}</p>
                <p>BA</p>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-2">
                <p className="font-semibold text-foreground">{categoryCounts.DA}</p>
                <p>Data</p>
              </div>
            </div>

            <div className="grid gap-2">
              {visibleMissions.map((mission) => {
                const missionEvaluation = evaluations[mission.id];
                const missionDraft = drafts[mission.id] ?? "";
                const missionState: PracticeState =
                  savedPortfolioId === `mission-${mission.id}`
                    ? "portfolio_ready"
                    : missionEvaluation
                      ? missionEvaluation.score >= 65
                        ? "submitted"
                        : "needs_revision"
                      : missionDraft.trim()
                        ? "draft"
                        : "new";

                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => {
                      setActiveId(mission.id);
                      setChatInput("");
                      setErrorText(null);
                    }}
                    className={cn(
                      "rounded-lg border p-3 text-left transition hover:border-primary/50",
                      activeMission.id === mission.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-foreground">{mission.title}</p>
                      {missionEvaluation ? (
                        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-foreground">
                          {missionEvaluation.score}%
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
                      <span className={cn("rounded-full border px-2 py-0.5", missionTone(mission.category))}>
                        {mission.category}
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5", stateCopy[missionState].tone)}>
                        {stateCopy[missionState].label}
                      </span>
                    </div>
                  </button>
                );
              })}
              {visibleMissions.length === 0 ? (
                <div className="rounded-lg border border-border bg-background/60 p-3 text-sm text-muted-foreground">
                  В этом направлении пока нет доступных миссий.
                </div>
              ) : null}
            </div>
          </aside>

          <article className="grid gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="surface-elevated space-y-4 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                      <span className={cn("rounded-full border px-2.5 py-1", missionTone(activeMission.category))}>
                        {activeMission.category}
                      </span>
                      <span className={cn("rounded-full border px-2.5 py-1", stateCopy[practiceState].tone)}>
                        {stateCopy[practiceState].label}
                      </span>
                      <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-muted-foreground">
                        {t(`difficulty.${activeMission.difficulty}`)} · +{activeMission.xpReward} XP
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">{activeMission.title}</h2>
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{activeMission.scenario}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Crosshair className="h-4 w-4 text-primary" />
                      Цель
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{activeMission.objective}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Что сдать
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{activeMission.expectedResult}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Навыки
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMission.skillsUsed.map((skill) => (
                        <span key={skill} className="rounded-full border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="surface-elevated space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">План выполнения</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {activeMission.steps.map((step, stepIndex) => (
                    <div key={`${activeMission.id}-${step}`} className="rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Шаг {stepIndex + 1}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/85">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-indigo-500/25 bg-indigo-500/10 p-3 text-sm text-indigo-100">
                  Используйте заметки и закладки как входные материалы, затем сохраните сильный результат в портфолио.
                </div>
              </section>

              <section className="surface-elevated space-y-4 p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      Рабочий артефакт
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Напишите итог так, будто это уйдёт наставнику или в рабочий чат команды.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activeDraft.trim().length} символов</span>
                </div>

                <textarea
                  ref={draftRef}
                  value={activeDraft}
                  onChange={(event) => updateDraft(event.target.value)}
                  placeholder="Например: краткий контекст, допущения, шаги, критерии проверки, риски и следующий шаг..."
                  className="textarea-base min-h-[260px] w-full resize-y bg-background"
                />

                {errorText ? (
                  <p className="inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    <AlertCircle className="h-4 w-4" />
                    {errorText}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Можно сначала уточнить детали в чате справа, затем сдать артефакт на оценку.
                  </p>
                  <button
                    type="button"
                    onClick={submitMission}
                    disabled={isSubmitting}
                    className="btn-primary gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Оценить миссию
                  </button>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="surface-elevated space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Стейкхолдер</h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Роль: {activeMission.roleContext}. Задайте вопросы, если в брифе не хватает фактов.
                </p>

                <div ref={chatContainerRef} className="max-h-[330px] space-y-3 overflow-y-auto rounded-lg border border-border bg-background/60 p-3">
                  {messages.map((message) => (
                    <div key={message.id} className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}>
                      {message.role === "ai" ? (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bot className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                      <p
                        className={cn(
                          "max-w-[82%] rounded-lg border px-3 py-2 text-xs leading-relaxed",
                          message.role === "user"
                            ? "border-primary/30 bg-primary/10 text-foreground"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {message.text}
                      </p>
                      {message.role === "user" ? (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <User className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </div>
                  ))}
                  {isAiTyping ? (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Печатает ответ...
                    </div>
                  ) : null}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Уточнить деталь..."
                    className="input-base min-w-0 flex-1"
                    disabled={isAiTyping}
                  />
                  <button
                    type="submit"
                    disabled={isAiTyping || !chatInput.trim()}
                    className="btn-secondary aspect-square px-0 disabled:opacity-50"
                    aria-label="Отправить сообщение"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </section>

              <section className="surface-elevated space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <PencilLine className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Feedback loop</h3>
                </div>

                {activeEvaluation ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-background/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Результат</p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">{activeEvaluation.score}%</p>
                      <p className="text-sm text-muted-foreground">{activeEvaluation.verdict}</p>
                    </div>

                    <FeedbackList title={t("strengths")} items={activeEvaluation.strengths} tone="text-emerald-300" />
                    <FeedbackList title={t("improvements")} items={activeEvaluation.improvements} tone="text-rose-300" />
                    <FeedbackList title={t("recoveryPlan")} items={activeEvaluation.recoveryPlan} tone="text-sky-300" />

                    <div className="grid gap-2">
                      {savedPortfolioId === activePortfolioId ? (
                        <Link href="/portfolio" className="btn-primary justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Открыть портфолио
                        </Link>
                      ) : (
                        <button type="button" onClick={saveToPortfolio} className="btn-primary gap-2">
                          <ClipboardCheck className="h-4 w-4" />
                          Сохранить в портфолио
                        </button>
                      )}
                      <button type="button" onClick={reviseMission} className="btn-secondary gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Исправить ответ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                    <p>1. Прочитайте бриф и цель.</p>
                    <p>2. Уточните детали у стейкхолдера, если нужно.</p>
                    <p>3. Напишите рабочий артефакт и отправьте на оценку.</p>
                    <p>4. Исправьте слабые места и сохраните результат в портфолио.</p>
                  </div>
                )}
              </section>
            </aside>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function FeedbackList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div>
      <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", tone)}>{title}</p>
      <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-border bg-background/50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
