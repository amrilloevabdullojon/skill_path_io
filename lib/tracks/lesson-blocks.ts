import { TrackCategory } from "@prisma/client";

type LessonLike = {
  id: string;
  title: string;
  body: string;
  order: number;
};

export type LessonBlockType =
  | "heading"
  | "paragraph"
  | "markdown"
  | "list"
  | "table"
  | "callout"
  | "code_block"
  | "image"
  | "video"
  | "quote"
  | "divider"
  | "key_idea"
  | "common_mistakes"
  | "real_world_example"
  | "important_concept"
  | "summary"
  | "quick_check"
  | "mini_challenge";

export type LessonQuickCheck = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonBlock = {
  id: string;
  type: LessonBlockType;
  title?: string;
  content?: string;
  items?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  code?: {
    language: string;
    value: string;
  };
  media?: {
    url: string;
    alt?: string;
  };
  quickCheck?: LessonQuickCheck;
  challengePrompt?: string;
  challengeHint?: string;
};

function makeId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function trackExample(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return "How Netflix teams validate API contracts to avoid production regressions.";
  }
  if (category === TrackCategory.BA) {
    return "How Amazon analysts use user stories and acceptance criteria in cross-team planning.";
  }
  return "How Spotify analysts use SQL and dashboards to track engagement and retention.";
}

function commonMistakes(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return [
      "Testing only happy-path scenarios",
      "Writing bug reports without reproducible steps",
      "Skipping regression checks before release",
    ];
  }
  if (category === TrackCategory.BA) {
    return [
      "Vague user stories without acceptance criteria",
      "No validation with stakeholders",
      "Mixing solution details into business requirements",
    ];
  }
  return [
    "Using wrong aggregation granularity",
    "Ignoring null values and outliers",
    "Presenting metrics without business context",
  ];
}

function quickCheck(category: TrackCategory): LessonQuickCheck {
  if (category === TrackCategory.QA) {
    return {
      question: "What does HTTP 200 usually mean in API testing?",
      options: ["Request failed", "Request succeeded", "User is unauthorized", "Server timeout"],
      correctIndex: 1,
      explanation: "HTTP 200 indicates successful request processing by the server.",
    };
  }
  if (category === TrackCategory.BA) {
    return {
      question: "What must a good user story include?",
      options: ["Only UI design", "A role, goal, and value", "Database schema", "Deployment script"],
      correctIndex: 1,
      explanation: "User story quality starts with role + intent + business value.",
    };
  }
  return {
    question: "What is the main purpose of SQL JOIN?",
    options: ["Create users", "Combine data from tables", "Deploy backend", "Format CSS"],
    correctIndex: 1,
    explanation: "JOIN links rows from two or more tables using related columns.",
  };
}

export function buildLessonBlocks(params: {
  category: TrackCategory;
  moduleTitle: string;
  moduleDescription: string;
  moduleOverview: string;
  outcomes: string[];
  resources: string[];
  lessons: LessonLike[];
}): LessonBlock[] {
  const {
    category,
    moduleTitle,
    moduleDescription,
    moduleOverview,
    outcomes,
    resources,
    lessons,
  } = params;
  const primaryLesson = lessons[0];
  const listItems = outcomes.length > 0 ? outcomes : ["Understand core ideas", "Apply in practice", "Prepare for quiz"];
  const resourceItems = resources.length > 0 ? resources : ["Read notes", "Try mini challenge", "Review quiz mistakes"];
  const qc = quickCheck(category);

  const blocks: LessonBlock[] = [
    {
      id: makeId("heading", 0),
      type: "heading",
      title: primaryLesson?.title ?? moduleTitle,
      content: moduleDescription,
    },
    {
      id: makeId("key-idea", 1),
      type: "key_idea",
      title: "Key Idea",
      content: moduleOverview || moduleDescription,
    },
    {
      id: makeId("paragraph", 2),
      type: "paragraph",
      content: primaryLesson?.body || "Core lesson explanation will be shown here.",
    },
    {
      id: makeId("markdown", 3),
      type: "markdown",
      content: "### Learning focus\n- Understand\n- Practice\n- Validate outcome",
    },
    {
      id: makeId("list", 4),
      type: "list",
      title: "What you will learn",
      items: listItems,
    },
    {
      id: makeId("table", 5),
      type: "table",
      title: "Concept map",
      table: {
        headers: ["Concept", "Why it matters", "How to practice"],
        rows: [
          ["Theory", "Build a foundation", "Read concise notes"],
          ["Practice", "Turn theory into skill", "Do tasks and checkpoints"],
          ["Review", "Avoid repeating mistakes", "Analyze feedback and quiz errors"],
        ],
      },
    },
    {
      id: makeId("callout", 6),
      type: "callout",
      title: "Important Concept",
      content: "Focus on reproducible workflow: hypothesis -> action -> validation.",
    },
    {
      id: makeId("code", 7),
      type: "code_block",
      title: "Code pattern",
      code: {
        language: "ts",
        value: "const progress = completed / total;\nif (progress >= 1) unlockNextModule();",
      },
    },
    {
      id: makeId("quote", 8),
      type: "quote",
      content: "Strong learners iterate quickly: learn, apply, reflect, improve.",
    },
    {
      id: makeId("real-world", 9),
      type: "real_world_example",
      title: "Real world example",
      content: trackExample(category),
    },
    {
      id: makeId("mistakes", 10),
      type: "common_mistakes",
      title: "Common Mistakes",
      items: commonMistakes(category),
    },
    {
      id: makeId("image", 11),
      type: "image",
      media: {
        url: "https://placehold.co/960x420/0f172a/94a3b8?text=SkillPath+Academy+Flow",
        alt: "Learning flow illustration",
      },
    },
    {
      id: makeId("video", 12),
      type: "video",
      media: {
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    },
    {
      id: makeId("divider", 13),
      type: "divider",
    },
    {
      id: makeId("quick-check", 14),
      type: "quick_check",
      title: "Quick Check",
      quickCheck: qc,
    },
    {
      id: makeId("mini-challenge", 15),
      type: "mini_challenge",
      title: "Mini Challenge",
      challengePrompt: `Apply today's idea from "${moduleTitle}" to a realistic task. Write a short action plan.`,
      challengeHint: "Use 3-5 bullet points: context, action, expected result.",
    },
    {
      id: makeId("summary", 16),
      type: "summary",
      title: "Summary",
      items: resourceItems,
      content: "You now have a structured path: concept, practice, validation, and next-step recommendation.",
    },
  ];

  return blocks;
}

export function buildLessonRecommendations(params: {
  hasNextLesson: boolean;
  nextLessonTitle: string | null;
  nextModuleTitle: string | null;
}) {
  return [
    {
      id: "next-lesson",
      title: params.hasNextLesson ? `Next lesson: ${params.nextLessonTitle}` : "Review current lesson",
      description: params.hasNextLesson
        ? "Continue momentum with the next timeline step."
        : "Reinforce key concepts before moving forward.",
    },
    {
      id: "recommended-module",
      title: params.nextModuleTitle ? `Recommended module: ${params.nextModuleTitle}` : "Recommended module: finish current track",
      description: "Keep progression consistent and unlock new skills.",
    },
    {
      id: "suggested-practice",
      title: "Suggested practice",
      description: "Complete quick check, pass quiz, and run simulation for maximum XP.",
    },
  ];
}
