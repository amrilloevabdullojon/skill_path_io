import Link from "next/link";

import { PublicProfileSnapshot } from "@/types/saas";

type PublicProfileViewProps = {
  profile: PublicProfileSnapshot;
};

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Public Profile</p>
        <h1 className="page-title">{profile.name}</h1>
        <p className="section-description">{profile.headline}</p>
        <p className="text-xs text-slate-500">Handle: @{profile.handle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Readiness score</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{profile.readinessScore}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Badges</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{profile.badges.length}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Portfolio highlights</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{profile.portfolioHighlights.length}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Mission outcomes</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{profile.missionOutcomes.length}</p>
        </article>
      </div>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Skill radar snapshot</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {profile.skillRadar.map((skill) => (
            <article key={skill.skill} className="surface-subtle space-y-2 p-3">
              <p className="text-xs text-slate-400">{skill.skill}</p>
              <p className="text-sm font-semibold text-slate-100">{skill.value}%</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-sky-400" style={{ width: `${skill.value}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {profile.badges.map((badge) => (
            <span
              key={badge.id}
              className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-200"
            >
              {badge.label}
            </span>
          ))}
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Mission outcomes</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {profile.missionOutcomes.map((item) => (
            <article key={item.title} className="surface-subtle space-y-1 p-3">
              <p className="text-sm font-semibold text-slate-100">{item.title}</p>
              <p className="text-xs text-slate-400">Score: {item.score}%</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-elevated flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-slate-300">Explore full learning workspace and live progress updates.</p>
        <Link href="/dashboard" className="btn-secondary">
          Open dashboard
        </Link>
      </section>
    </section>
  );
}
