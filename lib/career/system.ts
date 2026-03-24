import { calculateCareerReadiness } from "@/features/career-readiness/scoring";
import { matchJobsToSkills } from "@/features/job-matching/matcher";
import { nextRecommendedNode } from "@/features/knowledge-map/map";
import { buildPlannerForecast } from "@/features/planner/plan-builder";
import { JobPosting, KnowledgeNode, LearningPlan } from "@/types/personalization";

function buildDefaultJobs(track: "QA" | "BA" | "DA"): JobPosting[] {
  const base: JobPosting[] = [
    {
      id: "runtime-qa-junior",
      title: "Junior QA Engineer",
      level: "Junior",
      location: "Remote",
      requiredSkills: ["Manual Testing", "API Testing", "Bug Tracking"],
      description: "Role focused on feature testing and quality reporting.",
      roleTrack: "QA",
    },
    {
      id: "runtime-ba-junior",
      title: "Junior Business Analyst",
      level: "Junior",
      location: "Hybrid",
      requiredSkills: ["User Stories", "Acceptance Criteria", "Communication"],
      description: "Role focused on requirements and stakeholder alignment.",
      roleTrack: "BA",
    },
    {
      id: "runtime-da-junior",
      title: "Junior Data Analyst",
      level: "Junior",
      location: "Remote",
      requiredSkills: ["SQL", "Dashboards", "Communication"],
      description: "Role focused on product metrics and analysis.",
      roleTrack: "DA",
    },
  ];

  return base.filter((job) => job.roleTrack === track);
}

function buildDefaultKnowledgeNodes(track: "QA" | "BA" | "DA"): KnowledgeNode[] {
  if (track === "BA") {
    return [
      {
        id: "node-ba-user-stories",
        title: "User Stories",
        category: "Business Analysis",
        dependencies: [],
        completed: true,
        recommended: false,
        locked: false,
      },
      {
        id: "node-ba-acceptance-criteria",
        title: "Acceptance Criteria",
        category: "Business Analysis",
        dependencies: ["node-ba-user-stories"],
        completed: false,
        recommended: true,
        locked: false,
      },
    ];
  }

  if (track === "DA") {
    return [
      {
        id: "node-da-sql",
        title: "SQL",
        category: "Analytics",
        dependencies: [],
        completed: true,
        recommended: false,
        locked: false,
      },
      {
        id: "node-da-dashboards",
        title: "Dashboards",
        category: "Analytics",
        dependencies: ["node-da-sql"],
        completed: false,
        recommended: true,
        locked: false,
      },
    ];
  }

  return [
    {
      id: "node-qa-testing",
      title: "Manual Testing",
      category: "Testing",
      dependencies: [],
      completed: true,
      recommended: false,
      locked: false,
    },
    {
      id: "node-qa-api",
      title: "API Testing",
      category: "Testing",
      dependencies: ["node-qa-testing"],
      completed: false,
      recommended: true,
      locked: false,
    },
  ];
}

function buildDefaultPlan(goal: string, weeklyHours: number): LearningPlan {
  const pace = weeklyHours >= 8 ? "Intense" : weeklyHours >= 5 ? "Balanced" : "Light";
  const forecast = new Date();
  forecast.setDate(forecast.getDate() + (pace === "Intense" ? 45 : pace === "Balanced" ? 72 : 95));

  return {
    id: "plan-runtime",
    goal,
    weeklyHours,
    workload: pace,
    forecastDate: forecast.toISOString(),
    tasks: [
      {
        id: "task-lesson",
        title: "Complete one core lesson",
        type: "lesson",
        durationMinutes: 45,
        day: "Monday",
        priority: "High",
      },
      {
        id: "task-quiz",
        title: "Run one quiz remediation",
        type: "quiz",
        durationMinutes: 35,
        day: "Wednesday",
        priority: "High",
      },
      {
        id: "task-practice",
        title: "Execute one practical mission",
        type: "mission",
        durationMinutes: 60,
        day: "Friday",
        priority: "Medium",
      },
    ],
  };
}

export function buildCareerSystem(input: {
  role: "Junior QA" | "Junior BA" | "Junior Data Analyst";
  track: "QA" | "BA" | "DA";
  progressPercent: number;
  quizAccuracy: number;
  missionCompletionRate: number;
  simulationPerformance: number;
  radar: Array<{ skill: string; value: number }>;
  interests: string[];
  goal: string;
  weeklyHours: number;
  jobsCatalog?: JobPosting[];
  knowledgeNodes?: KnowledgeNode[];
  learningPlan?: LearningPlan;
}) {
  const readiness = calculateCareerReadiness({
    role: input.role,
    skillRadar: input.radar,
    quizAccuracy: input.quizAccuracy,
    missionCompletionRate: input.missionCompletionRate,
    simulationPerformance: input.simulationPerformance,
    progressPercent: input.progressPercent,
  });

  const jobs = matchJobsToSkills({
    jobs: input.jobsCatalog && input.jobsCatalog.length > 0 ? input.jobsCatalog : buildDefaultJobs(input.track),
    userSkills: [...input.interests, ...readiness.strengths],
    preferredTrack: input.track,
  });

  const plan = input.learningPlan ?? buildDefaultPlan(input.goal, input.weeklyHours);
  const forecast = buildPlannerForecast(plan);

  const knowledgeNodes = input.knowledgeNodes && input.knowledgeNodes.length > 0
    ? input.knowledgeNodes
    : buildDefaultKnowledgeNodes(input.track);
  const recommendedKnowledgeNode = nextRecommendedNode(knowledgeNodes);

  return {
    readiness,
    jobs,
    plan,
    forecast,
    knowledgeMap: {
      nodes: knowledgeNodes,
      nextNode: recommendedKnowledgeNode,
    },
    adaptiveSignal: {
      quizAccuracy: input.quizAccuracy,
      frequentMistakes: readiness.missingSkills.slice(0, 3),
      timeSpentMinutes: Math.max(180, Math.round(input.progressPercent * 45)),
      completedModules: Math.round(input.progressPercent / 20),
      skippedLessons: Math.max(0, 12 - Math.round(input.progressPercent / 10)),
      simulationPerformance: input.simulationPerformance,
    },
  };
}
