import { TeamAnalyticsSnapshot } from "@/types/saas";

type TeamLearningHubProps = {
  team: TeamAnalyticsSnapshot | null;
  isLocked: boolean;
  upgradePlanId?: string;
};

export function TeamLearningHub({ team, isLocked, upgradePlanId }: TeamLearningHubProps) {
  if (isLocked || !team) {
    return (
      <section className="surface-elevated space-y-3 p-5 sm:p-6">
        <p className="kicker">Team Learning (B2B)</p>
        <h1 className="page-title">Company dashboards and team analytics</h1>
        <p className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Team mode is available on the Team plan. Upgrade to {upgradePlanId ?? "TEAM"} to unlock invites, assignment controls, and team intelligence.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className="surface-elevated space-y-2 p-5 sm:p-6">
        <p className="kicker">Team Learning (B2B)</p>
        <h1 className="page-title">{team.teamName}</h1>
        <p className="section-description">Assign tracks, monitor progress, and optimize team learning velocity.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Members</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{team.members.length}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Average progress</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{team.averageProgress}%</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Learning velocity</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{team.averageVelocity}</p>
        </article>
        <article className="surface-elevated p-4">
          <p className="text-xs text-slate-500">Skill clusters</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{team.skillDistribution.length}</p>
        </article>
      </div>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Member progress</h2>
        <div className="grid gap-3">
          {team.members.map((member) => (
            <article key={member.userId} className="surface-subtle space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role} | {member.assignedTrack}</p>
                </div>
                <p className="text-sm font-semibold text-slate-100">{member.progressPercent}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${member.progressPercent}%` }} />
              </div>
              <p className="text-xs text-slate-400">Velocity: {member.velocity} | Strongest: {member.strongestSkill}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5">
        <h2 className="section-title">Skill distribution</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {team.skillDistribution.map((item) => (
            <article key={item.skill} className="surface-subtle p-4">
              <p className="text-sm font-semibold text-slate-100">{item.skill}</p>
              <p className="mt-1 text-xs text-slate-400">{item.members} team members</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
