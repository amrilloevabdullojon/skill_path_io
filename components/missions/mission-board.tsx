"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Crosshair, Loader2, Send, User, Bot, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import { EmptyState } from "@/components/ui/empty-state";
import { FadeInUp } from "@/components/ui/fade-in";
import { upsertPortfolioEntry } from "@/lib/portfolio/local-portfolio";
import { LearningMission, MissionEvaluation } from "@/types/personalization";

type MissionBoardProps = {
  missions: LearningMission[];
  isPlanLimited?: boolean;
  upgradeMessage?: string | null;
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

// Removed static simulator

export function MissionBoard({ missions, isPlanLimited = false }: MissionBoardProps) {
  const t = useTranslations("missionsPage.board");
  
  const [activeId, setActiveId] = useState(missions[0]?.id ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const [evaluation, setEvaluation] = useState<MissionEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  const activeMission = useMemo(
    () => missions.find((mission) => mission.id === activeId) ?? missions[0] ?? null,
    [activeId, missions],
  );

  // Initialize Chat when mission changes
  useEffect(() => {
    if (activeMission) {
      setMessages([
        { id: "ai-initial", role: "ai", text: t("chatGreeting", { role: activeMission.roleContext }) }
      ]);
      setEvaluation(null);
      setErrorText(null);
      setSavedPortfolioId(null);
      setChatInput("");
    }
  }, [activeMission, t]);

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiTyping || evaluation) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: chatInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setChatInput("");
    setIsAiTyping(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai/mission-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mission: activeMission, history: newMessages }),
      });

      const data = (await response.json()) as { text?: unknown; error?: unknown; message?: unknown };
      if (!response.ok || typeof data.text !== "string" || data.text.length === 0) {
        const errMsg =
          typeof data.message === "string" ? data.message :
          typeof data.error === "string" ? data.error :
          t("chatError");
        throw new Error(errMsg);
      }

      const aiText = data.text;
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", text: aiText }]);
    } catch (error) {
       setErrorText(error instanceof Error ? error.message : t("retryError"));
    } finally {
       setIsAiTyping(false);
    }
  }

  async function submitMission() {
    if (!activeMission) return;
    
    // Compile full chat log
    const userWords = messages.filter(m => m.role === 'user').reduce((acc, m) => acc + m.text + " ", "");
    
    if (userWords.trim().length < 20) {
      setErrorText(t("tooShort"));
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    // Combine history for the backend evaluator
    const submissionTranscript = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n");

    try {
      const response = await fetch("/api/missions/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mission: activeMission, submission: submissionTranscript }),
      });

      const data = (await response.json()) as { evaluation?: MissionEvaluation; error?: string };
      if (!response.ok || !data.evaluation) {
        throw new Error(data.error || "Mission evaluation failed");
      }

      setEvaluation(data.evaluation);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Mission evaluation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">{t("kicker") ?? "ОБУЧЕНИЕ НА ПРАКТИКЕ"}</p>
        <h1 className="page-title leading-tight">{t("title")}</h1>
        <p className="section-description">{t("description")}</p>
        {isPlanLimited ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2">
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
      ) : (
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Sidebar */}
        <aside className="surface-elevated space-y-3 p-4 self-start" role="tablist" aria-label={t("availableMissions")}>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("availableMissions")}</h2>
          {missions.map((mission, i) => (
            <FadeInUp key={mission.id} delay={i * 0.04}>
              <button
                type="button"
                role="tab"
                aria-selected={activeId === mission.id}
                aria-controls={`mission-panel-${mission.id}`}
                id={`mission-tab-${mission.id}`}
                onClick={() => setActiveId(mission.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  activeId === mission.id
                    ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    : "border-border bg-card hover:border-border/70 hover:bg-muted/50"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{mission.title}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide">
                  <span className={`rounded-full border px-2 py-0.5 ${
                    mission.difficulty === "Hard"
                      ? "border-rose-400/35 bg-rose-500/10 text-rose-300"
                      : mission.difficulty === "Medium"
                        ? "border-amber-400/35 bg-amber-500/10 text-amber-300"
                        : "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                  }`}>
                    {t(`difficulty.${mission.difficulty}`)}
                  </span>
                  <span className="rounded-full border border-indigo-400/35 bg-indigo-500/10 px-2 py-0.5 text-indigo-300">+{mission.xpReward} XP</span>
                </div>
              </button>
            </FadeInUp>
          ))}
        </aside>

        {/* Main Content Area */}
        {activeMission && isMounted ? (
          <article className="surface-elevated flex flex-col h-[750px] overflow-hidden">
            {/* Top Bar Context */}
            <div className="p-5 border-b border-border/50 bg-muted/10 shrink-0">
               <div className="flex items-start justify-between gap-4">
                  <div>
                     <p className="text-base font-bold text-foreground">{t("missionBriefing")}</p>
                     <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mt-1">{activeMission.scenario}</p>
                  </div>
                  <div className="shrink-0 max-w-[200px]">
                     <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">{t("yourGoal")}</p>
                     <p className="text-xs text-foreground mt-0.5 leading-snug">{activeMission.objective}</p>
                  </div>
               </div>
            </div>

            {/* Chat History */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50">
              {messages.map((m) => (
                 <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4 flex gap-3 ${
                      m.role === 'user'
                        ? 'bg-indigo-500/15 border border-indigo-400/20 text-foreground'
                        : 'bg-card border border-border text-foreground'
                    }`}>
                      {m.role === 'ai' && (
                         <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4" />
                         </div>
                      )}
                      <p className="text-sm leading-relaxed">{m.text}</p>
                      {m.role === 'user' && (
                         <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <User className="h-4 w-4" />
                         </div>
                      )}
                    </div>
                 </div>
              ))}
              
              {isAiTyping && (
                <div className="flex justify-start">
                   <div className="rounded-2xl p-4 flex gap-3 bg-card border border-border text-foreground">
                      <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                         <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full" />
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Chat Input & Submit Area */}
            {!evaluation ? (
              <div className="p-4 border-t border-border/50 bg-background shrink-0 space-y-4">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <textarea
                    disabled={isAiTyping}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={t("chatPlaceholder")}
                    className="w-full textarea-base py-3 pr-16 bg-card"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={isAiTyping || !chatInput.trim()}
                    className="absolute right-2 p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                <div className="flex items-center justify-between">
                  {errorText ? <p className="text-xs text-rose-400 inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errorText}</p> : <div/>}
                  <button
                    type="button"
                    onClick={submitMission}
                    disabled={isSubmitting || messages.length < 3}
                    className="btn-primary inline-flex items-center gap-2 border border-emerald-400/50 bg-emerald-500 text-white shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {t("submitChat")}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Evaluation Results Banner (Shown when evaluation state is populated) */}
            <AnimatePresence>
              {evaluation && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   className="border-t-2 border-emerald-500 shrink-0 bg-emerald-500/5"
                 >
                   <div className="p-5 overflow-y-auto max-h-[300px]">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                        <p className="inline-flex items-center gap-2 text-lg font-bold text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                          {t("analysisResult", { verdict: evaluation.verdict, score: evaluation.score })}
                        </p>
                        
                        <div className="flex gap-2">
                           {savedPortfolioId !== `mission-${activeMission.id}` && (
                             <button
                               onClick={() => {
                                 const entryId = `mission-${activeMission.id}`;
                                 upsertPortfolioEntry({
                                   id: entryId,
                                   title: activeMission.title,
                                   description: activeMission.scenario,
                                   skillsUsed: activeMission.skillsUsed,
                                   resultSummary: `Conversation Analysis: ${evaluation.score}% (${evaluation.verdict}). Demonstrated practical communication.`,
                                   source: "mission",
                                   sourceRef: activeMission.id,
                                   createdAt: new Date().toISOString(),
                                 });
                                 setSavedPortfolioId(entryId);
                               }}
                               className="btn-secondary text-xs py-1"
                             >
                               {t("savePortfolio")}
                             </button>
                           )}
                           <button
                             onClick={() => {
                               setEvaluation(null);
                               setMessages([{ id: "ai-initial", role: "ai", text: t("chatGreeting", { role: activeMission.roleContext }) }]);
                             }}
                             className="btn-secondary text-xs py-1 hover:border-amber-400"
                           >
                             {t("retryMission")}
                           </button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-background rounded-xl p-3 border border-border">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">{t("strengths")}</p>
                          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            {evaluation.strengths.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                        <div className="bg-background rounded-xl p-3 border border-border">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-2">{t("improvements")}</p>
                          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            {evaluation.improvements.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                        <div className="bg-background rounded-xl p-3 border border-border">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">{t("recoveryPlan")}</p>
                          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            {evaluation.recoveryPlan.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      </div>
                   </div>
                 </motion.div>
              )}
            </AnimatePresence>

          </article>
        ) : null}
      </div>
      )}
    </section>
  );
}
