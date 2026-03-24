import { Briefcase, CheckCircle2, CircleAlert, Sparkles } from "lucide-react";

import { JobMatchResult } from "@/types/personalization";

function matchTone(percent: number) {
  if (percent >= 80) return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
  if (percent >= 60) return "border-amber-400/35 bg-amber-500/10 text-amber-200";
  return "border-rose-400/35 bg-rose-500/10 text-rose-200";
}

export function JobMatchingBoard({ jobs }: { jobs: JobMatchResult[] }) {
  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Job Matching</p>
        <h1 className="page-title">Roles mapped to your current skill set</h1>
        <p className="section-description">Use match percentage and missing requirements to decide what to study next.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {jobs.map((job) => (
          <article key={job.id} className="surface-elevated space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-100">{job.title}</p>
                <p className="text-xs text-slate-500">{job.level} | {job.location}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${matchTone(job.matchPercent)}`}>
                {job.matchPercent}% match
              </span>
            </div>

            <p className="text-sm text-slate-300">{job.description}</p>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Required skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span key={skill} className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-subtle space-y-2 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Briefcase className="h-4 w-4 text-sky-300" />
                Missing requirements
              </p>
              {job.missingRequirements.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">
                  {job.missingRequirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="inline-flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  No critical skill gaps
                </p>
              )}
            </div>

            <p className="inline-flex items-start gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
              <Sparkles className="mt-0.5 h-4 w-4" />
              {job.recommendation}
            </p>

            <p className="inline-flex items-center gap-2 text-xs text-slate-500">
              <CircleAlert className="h-3.5 w-3.5" />
              Mock vacancies now, easily replaceable with real source/API.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
