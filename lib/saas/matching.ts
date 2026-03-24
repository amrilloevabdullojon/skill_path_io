import { JobMatch, MarketplaceRole } from "@/types/saas";

type BuildJobMatchInput = {
  roles: MarketplaceRole[];
  userSkills: string[];
  portfolioSkills: string[];
  missionOutcomes: Array<{ title: string; score: number; skills: string[] }>;
  readinessScore: number;
};

function toSet(values: string[]) {
  return new Set(values.map((value) => value.toLowerCase()));
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function buildSaasJobMatches(input: BuildJobMatchInput): JobMatch[] {
  const userSkillSet = toSet(input.userSkills);
  const portfolioSkillSet = toSet(input.portfolioSkills);

  const missionScore =
    input.missionOutcomes.length > 0
      ? Math.round(input.missionOutcomes.reduce((sum, item) => sum + item.score, 0) / input.missionOutcomes.length)
      : 0;

  return input.roles
    .map((role) => {
      const required = role.requiredSkills.map((item) => item.toLowerCase());
      const coveredSkills = required.filter((skill) => userSkillSet.has(skill)).length;
      const coverageRatio = required.length > 0 ? coveredSkills / required.length : 0;

      const portfolioEvidence = required.filter((skill) => portfolioSkillSet.has(skill)).length;
      const portfolioRatio = required.length > 0 ? portfolioEvidence / required.length : 0;

      const readinessFactor = clamp(input.readinessScore / Math.max(role.minReadinessScore, 1), 0, 1);

      const score = Math.round(
        coverageRatio * 60
        + portfolioRatio * 20
        + (missionScore / 100) * 10
        + readinessFactor * 10,
      );

      const missingSkills = role.requiredSkills.filter(
        (skill) => !userSkillSet.has(skill.toLowerCase()) && !portfolioSkillSet.has(skill.toLowerCase()),
      );

      const evidenceSignals: string[] = [];
      if (portfolioEvidence > 0) {
        evidenceSignals.push(`${portfolioEvidence} required skills backed by portfolio`);
      }
      if (missionScore >= 75) {
        evidenceSignals.push(`Mission outcomes are strong (${missionScore} avg)`);
      }
      if (input.readinessScore >= role.minReadinessScore) {
        evidenceSignals.push(`Readiness score meets role baseline`);
      }

      return {
        roleId: role.id,
        title: role.title,
        company: role.company,
        matchPercent: clamp(score),
        missingSkills,
        evidenceSignals,
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);
}
