import { ArrowUpRight, BriefcaseBusiness, TrendingUp } from "lucide-react";

import { ReadinessSnapshot } from "@/types/personalization";

export function CareerReadinessDashboard({
  role,
  readiness,
  coveredSkills,
  recommendedActions,
}: {
  role: "Junior QA" | "Junior BA" | "Junior Data Analyst";
  readiness: ReadinessSnapshot;
  coveredSkills: string[];
  recommendedActions: string[];
}) {
  return (
    <section className="space-y-6">
      <header className="surface-elevated space-y-3 p-5 sm:p-6">
        <p className="kicker">Career Readiness</p>
        <h1 className="page-title">Target role: {role}</h1>
        <p className="section-description">Track your readiness score, missing skills, and next milestone toward job-level outcomes.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-elevated space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Readiness score</h2>
            <span className="rounded-full border border-sky-400/35 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-200">
              {readiness.level}
            </span>
          </div>

          <p className="text-4xl font-semibold text-foreground">{readiness.score}%</p>
          <div className="progress-track h-2">
            <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${readiness.score}%` }} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="surface-subtle p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress to target role</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{readiness.progressToGoal}%</p>
            </div>
            <div className="surface-subtle p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Next milestone</p>
              <p className="mt-1 text-sm text-muted-foreground">{readiness.nextMilestone}</p>
            </div>
          </div>
        </article>

        <article className="surface-elevated space-y-4 p-5">
          <h2 className="text-lg font-semibold text-foreground">Skill gap indicators</h2>
          <div className="space-y-2">
            {readiness.missingSkills.map((skill) => (
              <div key={skill} className="flex items-center justify-between rounded-xl border border-amber-400/25 bg-amber-500/8 px-3 py-2">
                <span className="text-sm text-amber-100">{skill}</span>
                <span className="text-xs text-amber-300">Gap</span>
              </div>
            ))}
          </div>
          <div className="surface-subtle p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended learning actions</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="surface-elevated space-y-3 p-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
            <TrendingUp className="h-4 w-4" />
            Skills already covered
          </p>
          <div className="flex flex-wrap gap-2">
            {coveredSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-emerald-400/30 bg-emerald-500/12 px-2.5 py-1 text-xs text-emerald-200">
                {skill}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-elevated space-y-3 p-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200">
            <BriefcaseBusiness className="h-4 w-4" />
            Career action
          </p>
          <p className="text-sm text-muted-foreground">Move from theory to interview readiness by closing top 2 gaps this week.</p>
          <a href="/jobs" className="btn-secondary inline-flex items-center gap-2">
            Open job matching
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </article>
      </div>
    </section>
  );
}
