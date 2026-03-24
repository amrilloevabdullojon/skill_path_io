import { TrackCategory } from "@prisma/client";

export type SkillLeaf = {
  id: string;
  title: string;
  description: string;
  category: TrackCategory;
};

export type SkillBranch = {
  id: string;
  title: string;
  category: TrackCategory;
  children: SkillLeaf[];
};

export const SKILL_TREE: SkillBranch[] = [
  {
    id: "testing",
    title: "Testing",
    category: TrackCategory.QA,
    children: [
      {
        id: "manual-testing",
        title: "Manual testing",
        description: "Test design, bug reports, exploratory sessions",
        category: TrackCategory.QA,
      },
      {
        id: "api-testing",
        title: "API testing",
        description: "REST validation, contracts, and edge cases",
        category: TrackCategory.QA,
      },
      {
        id: "automation",
        title: "Automation",
        description: "UI and API automation strategy",
        category: TrackCategory.QA,
      },
    ],
  },
  {
    id: "business-analysis",
    title: "Business Analysis",
    category: TrackCategory.BA,
    children: [
      {
        id: "discovery",
        title: "Discovery",
        description: "Stakeholder interviews and scope framing",
        category: TrackCategory.BA,
      },
      {
        id: "user-stories",
        title: "User stories",
        description: "Narratives, acceptance criteria, edge flows",
        category: TrackCategory.BA,
      },
      {
        id: "process-modeling",
        title: "Process modeling",
        description: "BPMN/UML and handoff artifacts",
        category: TrackCategory.BA,
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    category: TrackCategory.DA,
    children: [
      {
        id: "sql",
        title: "SQL",
        description: "Joins, windows, aggregations, and diagnostics",
        category: TrackCategory.DA,
      },
      {
        id: "visualization",
        title: "Visualization",
        description: "Dashboard storytelling and chart quality",
        category: TrackCategory.DA,
      },
      {
        id: "statistics",
        title: "Statistics",
        description: "Experiments, cohorts, and confidence",
        category: TrackCategory.DA,
      },
    ],
  },
];

export function categoryAccent(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }
  if (category === TrackCategory.BA) {
    return "border-orange-400/30 bg-orange-500/10 text-orange-200";
  }
  return "border-violet-400/30 bg-violet-500/10 text-violet-200";
}
