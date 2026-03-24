"use client";

import { useState } from "react";

import { CandidateProfile, JobMatch, MarketplaceRole } from "@/types/saas";

type HiringMarketplaceHubProps = {
  roles: MarketplaceRole[];
  candidates: CandidateProfile[];
  topMatches: JobMatch[];
  isLocked: boolean;
  upgradePlanId?: string;
};

export function HiringMarketplaceHub({
  roles,
  candidates,
  topMatches,
  isLocked,
  upgradePlanId,
}: HiringMarketplaceHubProps) {
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  async function apply(roleId: string) {
    setIsApplying(true);
    setStatusText(null);

    try {
      const response = await fetch("/api/marketplace/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          roleId,
          portfolioUrl: "/portfolio",
        }),
      });
      const data = (await response.json()) as { error?: string; application?: { id: string } };
      if (!response.ok || !data.application) {
        throw new Error(data.error || "Could not submit application.");
      }
      setStatusText(`Application submitted (${data.application.id}).`);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Application failed.");
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Hiring Marketplace</p>
        <h1 className="page-title">Roles, portfolios, and readiness-based hiring</h1>
        <p className="section-description">
          Companies can post roles, discover candidate portfolios, and review readiness intelligence.
        </p>
        {isLocked ? (
          <p className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            Marketplace is locked for this plan. Upgrade to {upgradePlanId ?? "Career Accelerator"}.
          </p>
        ) : null}
      </header>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Role postings</h2>
        <div className="grid gap-3 xl:grid-cols-2">
          {roles.map((role) => (
            <article key={role.id} className="surface-subtle space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-slate-100">{role.title}</p>
                  <p className="text-xs text-slate-500">{role.company} | {role.location}</p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300">
                  Min readiness: {role.minReadinessScore}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {role.requiredSkills.map((skill) => (
                  <span key={skill} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => apply(role.id)}
                disabled={isLocked || isApplying}
                className="btn-primary disabled:opacity-60"
              >
                Apply with profile
              </button>
            </article>
          ))}
        </div>
        {statusText ? <p className="text-xs text-slate-300">{statusText}</p> : null}
      </section>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Candidate portfolios</h2>
        <div className="grid gap-3 xl:grid-cols-2">
          {candidates.map((candidate) => (
            <article key={candidate.userId} className="surface-subtle space-y-2 p-4">
              <p className="text-sm font-semibold text-slate-100">{candidate.name}</p>
              <p className="text-xs text-slate-500">@{candidate.publicHandle}</p>
              <p className="text-xs text-slate-300">Readiness: {candidate.readinessScore}</p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-sky-400/30 bg-sky-500/12 px-2 py-0.5 text-[11px] text-sky-200">
                    {badge}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Job matching engine output</h2>
        <div className="grid gap-3 xl:grid-cols-2">
          {topMatches.map((match) => (
            <article key={match.roleId} className="surface-subtle space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{match.title}</p>
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/12 px-2 py-0.5 text-[11px] text-emerald-200">
                  Match: {match.matchPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-500">{match.company}</p>
              <p className="text-xs text-slate-300">
                Missing skills: {match.missingSkills.length > 0 ? match.missingSkills.join(", ") : "None"}
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-400">
                {match.evidenceSignals.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
