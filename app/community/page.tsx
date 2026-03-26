import type { Metadata } from "next";

import { CommunityLearningLayer } from "@/components/community/community-learning-layer";
import { StudyGroupsPanel } from "@/components/community/study-groups-panel";
import { getCommunityDiscussions, getPeerFeedbackQueue } from "@/lib/saas/community";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community — SkillPath Academy",
  description: "Collaborate with peers, join study groups, and share your learning journey.",
};

export default async function CommunityPage() {
  const [discussions, feedback] = await Promise.all([
    getCommunityDiscussions(),
    getPeerFeedbackQueue(),
  ]);

  return (
    <section className="page-shell space-y-6">
      <CommunityLearningLayer discussions={discussions} feedback={feedback} />
      <StudyGroupsPanel />
    </section>
  );
}
