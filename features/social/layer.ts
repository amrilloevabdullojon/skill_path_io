import { DiscussionThread, StudyGroup } from "@/types/personalization";

export function topActiveThreads(threads: DiscussionThread[], count = 5) {
  return [...threads].sort((a, b) => b.replies - a.replies).slice(0, count);
}

export function communitySummary(groups: StudyGroup[], threads: DiscussionThread[]) {
  const totalMembers = groups.reduce((sum, group) => sum + group.members, 0);
  const totalReplies = threads.reduce((sum, thread) => sum + thread.replies, 0);

  return {
    groups: groups.length,
    members: totalMembers,
    threads: threads.length,
    replies: totalReplies,
  };
}
