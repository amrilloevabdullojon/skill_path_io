"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Crosshair, Loader2, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { FadeInUp } from "@/components/ui/fade-in";
import { upsertPortfolioEntry } from "@/lib/portfolio/local-portfolio";
import { LearningMission, MissionEvaluation } from "@/types/personalization";

type MissionBoardProps = {
  missions: LearningMission[];
  isPlanLimited?: boolean;
  upgradeMessage?: string | null;
};

export function MissionBoard({ missions, isPlanLimited = false, upgradeMessage = null }: MissionBoardProps) {
  const [activeId, setActiveId] = useState(missions[0]?.id ?? "");
  const [submission, setSubmission] = useState("");
  const [evaluation, setEvaluation] = useState<MissionEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);

  const activeMission = useMemo(
    () => missions.find((mission) => mission.id === activeId) ?? missions[0] ?? null,
    [activeId, missions],
  );

  async function submitMission() {
    if (!activeMission || submission.trim().length < 20) {
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
        <p className="kicker">Mission-Based Learning</p>
        <h1 className="page-title">Scenario missions with real work context</h1>
        <p className="section-description">Learn by solving concrete work situations with AI-backed evaluation and recovery hints.</p>
        {isPlanLimited && upgradeMessage ? (
          <p className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            {upgradeMessage}
          </p>
        ) : null}
      </header>

      {missions.length === 0 ? (
        <EmptyState
          icon={Crosshair}
          title="No missions available"
          description="Missions are tailored to your learning track. Complete more lessons to unlock them."
          actionLabel="Go to tracks"
          actionHref="/tracks"
        />
      ) : (
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <aside className="surface-elevated space-y-3 p-4">
          {missions.map((mission, i) => (
            <FadeInUp key={mission.id} delay={i * 0.04}>
            <button
              type="button"
              onClick={() => {
                setActiveId(mission.id);
                setSubmission("");
                setEvaluation(null);
                setSavedPortfolioId(null);
              }}
              className={`w-full rounded-xl border p-3 text-left transition ${
                activeId === mission.id
                  ? "border-sky-400/40 bg-sky-500/12"
                  : "border-border bg-card/70 hover:border-border/70"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{mission.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{mission.roleContext}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide">
                <span className="chip-neutral px-2 py-0.5">{mission.difficulty}</span>
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">+{mission.xpReward} XP</span>
                <span className="chip-neutral px-2 py-0.5">{mission.status}</span>
              </div>
            </button>
            </FadeInUp>
          ))}
        </aside>

        {activeMission ? (
          <article className="surface-elevated space-y-4 p-5">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">{activeMission.title}</p>
              <p className="text-sm text-muted-foreground">{activeMission.scenario}</p>
            </div>

            <div className="surface-subtle space-y-2 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200">
                <Crosshair className="h-4 w-4" />
                Mission objective
              </p>
              <p className="text-sm text-foreground">{activeMission.objective}</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {activeMission.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-1.5">
                {activeMission.skillsUsed.map((skill) => (
                  <span
                    key={`${activeMission.id}-${skill}`}
                    className="rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <label className="space-y-2 text-sm text-muted-foreground">
              Mission submission
              <textarea
                value={submission}
                onChange={(event) => setSubmission(event.target.value)}
                className="textarea-base min-h-[140px]"
                placeholder="Write your mission result, decisions, and final output..."
              />
            </label>

              <button
                type="button"
                onClick={submitMission}
                disabled={isSubmitting || submission.trim().length < 20}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Evaluate with AI
            </button>

            {errorText ? <p role="alert" className="state-error">{errorText}</p> : null}

            {evaluation ? (
              <div className="space-y-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Result: {evaluation.verdict} ({evaluation.score}%)
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-200">Strengths</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-emerald-100">
                      {evaluation.strengths.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-200">Improvements</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-amber-100">
                      {evaluation.improvements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-sky-200">Recovery plan</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-sky-100">
                      {evaluation.recoveryPlan.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      const entryId = `mission-${activeMission.id}`;
                      upsertPortfolioEntry({
                        id: entryId,
                        title: activeMission.title,
                        description: activeMission.scenario,
                        skillsUsed: activeMission.skillsUsed,
                        resultSummary: `Score ${evaluation.score}% (${evaluation.verdict}). ${submission.trim().slice(0, 180)}`,
                        source: "mission",
                        sourceRef: activeMission.id,
                        createdAt: new Date().toISOString(),
                      });
                      setSavedPortfolioId(entryId);
                    }}
                  >
                    Add to portfolio
                  </button>
                  {savedPortfolioId === `mission-${activeMission.id}` ? (
                    <span className="rounded-full border border-emerald-400/35 bg-emerald-500/12 px-2.5 py-1 text-xs text-emerald-200">
                      Saved. Open /portfolio
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </article>
        ) : null}
      </div>
      )}
    </section>
  );
}
