import { matchJobsToSkills } from "@/features/job-matching/matcher";
import { JobPosting, TrackTag } from "@/types/personalization";

export function buildJobMatches(input: {
  jobs: JobPosting[];
  userSkills: string[];
  preferredTrack?: TrackTag;
}) {
  return matchJobsToSkills({
    jobs: input.jobs,
    userSkills: input.userSkills,
    preferredTrack: input.preferredTrack,
  });
}
