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
        <p className="text-xs text-muted-foreground">Handle: @{profile.handle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Readiness score</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{profile.readinessScore}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Badges</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{profile.badges.length}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Portfolio highlights</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{profile.portfolioHighlights.length}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Mission outcomes</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{profile.missionOutcomes.length}</p>
        </article>
      </div>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Skill radar snapshot</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {profile.skillRadar.map((skill) => (
            <article key={skill.skill} className="surface-subtle space-y-2 p-3">
              <p className="text-xs text-muted-foreground">{skill.skill}</p>
              <p className="text-sm font-semibold text-foreground">{skill.value}%</p>
              <div className="progress-track h-1.5">
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
              className="chip-neutral px-2.5 py-1 text-xs"
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
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">Score: {item.score}%</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-elevated flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-muted-foreground">Explore full learning workspace and live progress updates.</p>
        <Link href="/dashboard" className="btn-secondary">
          Open dashboard
        </Link>
      </section>
    </section>
  );
}
