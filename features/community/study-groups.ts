export type StudyGroup = {
  id: string;
  title: string;
  topic: string;
  membersCount: number;
  description: string;
};

export type PeerReviewTask = {
  id: string;
  title: string;
  track: "QA" | "BA" | "DA";
  author: string;
  type: "Bug report" | "User story" | "SQL analysis" | "Analytics memo";
  submittedAt: string;
};

export const studyGroupsSeed: StudyGroup[] = [
  {
    id: "grp-qa-1",
    title: "QA Bug Hunters",
    topic: "Bug report quality and API checks",
    membersCount: 12,
    description: "Weekly peer sessions for QA scenarios and issue triage.",
  },
  {
    id: "grp-ba-1",
    title: "BA Discovery Crew",
    topic: "User stories and acceptance criteria",
    membersCount: 9,
    description: "Hands-on breakdown of requirements and stakeholder communication.",
  },
  {
    id: "grp-da-1",
    title: "Data Insights Club",
    topic: "SQL practice and product analytics",
    membersCount: 15,
    description: "Collaborative SQL drills and dashboard feedback.",
  },
];

export const peerReviewQueueSeed: PeerReviewTask[] = [
  {
    id: "review-1",
    title: "Checkout flow bug report",
    track: "QA",
    author: "A. Karimov",
    type: "Bug report",
    submittedAt: "2h ago",
  },
  {
    id: "review-2",
    title: "Subscription cancellation story",
    track: "BA",
    author: "M. Lee",
    type: "User story",
    submittedAt: "5h ago",
  },
  {
    id: "review-3",
    title: "Retention cohort SQL analysis",
    track: "DA",
    author: "S. Khan",
    type: "SQL analysis",
    submittedAt: "1d ago",
  },
];
