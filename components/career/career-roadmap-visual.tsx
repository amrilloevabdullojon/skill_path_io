import { CheckCircle2, Circle } from "lucide-react";

type CareerRoadmapVisualProps = {
  readinessScore: number;
};

type Stage = {
  id: string;
  title: string;
  description: string;
  unlockOutcome: string;
  threshold: number;
};

const stages: Stage[] = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Set role target and baseline skills.",
    unlockOutcome: "Personal onboarding profile",
    threshold: 10,
  },
  {
    id: "foundations",
    title: "Foundations",
    description: "Complete core modules and key lessons.",
    unlockOutcome: "Core skill badge",
    threshold: 30,
  },
  {
    id: "practice",
    title: "Practice",
    description: "Pass quizzes and practical checkpoints.",
    unlockOutcome: "Validated practice score",
    threshold: 50,
  },
  {
    id: "missions",
    title: "Missions",
    description: "Solve realistic role-based scenarios.",
    unlockOutcome: "Portfolio artifact pack",
    threshold: 65,
  },
  {
    id: "interview-ready",
    title: "Interview Ready",
    description: "Complete mock interview and remediation.",
    unlockOutcome: "Interview readiness report",
    threshold: 78,
  },
  {
    id: "job-ready",
    title: "Job Ready",
    description: "Close remaining skill gaps and finalize plan.",
    unlockOutcome: "Career action roadmap",
    threshold: 90,
  },
];

export function CareerRoadmapVisual({ readinessScore }: CareerRoadmapVisualProps) {
  return (
    <section className="surface-elevated space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">Career Roadmap</h2>
        <span className="chip-neutral px-2.5 py-1 text-xs">
          readiness {readinessScore}%
        </span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const unlocked = readinessScore >= stage.threshold;
          return (
            <div key={stage.id} className="space-y-2">
              <article
                className={`surface-subtle p-3 ${
                  unlocked ? "border-emerald-400/25 bg-emerald-500/8" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{stage.title}</p>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Unlock: {stage.unlockOutcome}</p>
                  </div>
                  <span className="mt-0.5">
                    {unlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                </div>
              </article>
              {index < stages.length - 1 ? <div className="mx-2 h-4 border-l border-border" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

