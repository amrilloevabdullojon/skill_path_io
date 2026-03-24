import { TeamAnalyticsSnapshot, TeamMemberProgress } from "@/types/saas";

type BuildTeamAnalyticsInput = {
  teamId: string;
  teamName: string;
  members: TeamMemberProgress[];
};

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function buildTeamAnalytics(input: BuildTeamAnalyticsInput): TeamAnalyticsSnapshot {
  const skillMap = new Map<string, number>();

  for (const member of input.members) {
    const current = skillMap.get(member.strongestSkill) ?? 0;
    skillMap.set(member.strongestSkill, current + 1);
  }

  return {
    teamId: input.teamId,
    teamName: input.teamName,
    members: input.members,
    averageProgress: average(input.members.map((member) => member.progressPercent)),
    averageVelocity: average(input.members.map((member) => member.velocity)),
    skillDistribution: [...skillMap.entries()].map(([skill, members]) => ({
      skill,
      members,
    })),
  };
}
