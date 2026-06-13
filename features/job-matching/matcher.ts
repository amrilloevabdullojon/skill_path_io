import { JobMatchResult, JobPosting, TrackTag } from "@/types/personalization";

export function matchJobsToSkills(params: {
  jobs: JobPosting[];
  userSkills: string[];
  preferredTrack?: TrackTag;
}): JobMatchResult[] {
  const userSkillsSet = new Set(params.userSkills.map((skill) => skill.toLowerCase()));

  return params.jobs
    .filter((job) => (params.preferredTrack ? job.roleTrack === params.preferredTrack : true))
    .map((job) => {
      const matched = job.requiredSkills.filter((skill) => userSkillsSet.has(skill.toLowerCase()));
      const missing = job.requiredSkills.filter((skill) => !userSkillsSet.has(skill.toLowerCase()));
      const matchPercent = Math.round((matched.length / Math.max(job.requiredSkills.length, 1)) * 100);

      return {
        ...job,
        matchPercent,
        missingRequirements: missing,
        recommendation:
          missing.length > 0
            ? `Сфокусируйтесь на: ${missing.slice(0, 2).join(", ")}`
            : "Вы готовы. Начинайте готовиться к интервью.",
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);
}
