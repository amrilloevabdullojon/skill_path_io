import {
  AdminActivityLog,
  Course,
  CourseAnalyticsSnapshot,
  CourseAssignment,
  CourseCaseStudy,
  CourseLesson,
  CourseModule,
  CourseQuiz,
  CourseSimulation,
  CourseStudioEntity,
  CourseTemplate,
  MediaAsset,
} from "@/types/builder/course-builder";
import { createId, defaultLessonBlock, defaultUnlockRule, nowIso, slugify } from "@/lib/course-builder/helpers";

function baseCourse(overrides: Partial<Course>): Course {
  const now = nowIso();
  const title = overrides.title ?? "New Course";

  return {
    id: overrides.id ?? createId("course"),
    slug: overrides.slug ?? slugify(title),
    title,
    shortTitle: overrides.shortTitle ?? title,
    description: overrides.description ?? "Course description",
    shortDescription: overrides.shortDescription ?? "Short description",
    category: overrides.category ?? "QA",
    level: overrides.level ?? "BEGINNER",
    language: overrides.language ?? "ru",
    coverImage: overrides.coverImage ?? "",
    icon: overrides.icon ?? "book-open",
    themeColor: overrides.themeColor ?? "#38bdf8",
    estimatedDuration: overrides.estimatedDuration ?? 360,
    tags: overrides.tags ?? [],
    outcomes: overrides.outcomes ?? [],
    requirements: overrides.requirements ?? [],
    targetAudience: overrides.targetAudience ?? "",
    status: overrides.status ?? "DRAFT",
    featured: overrides.featured ?? false,
    certificateEnabled: overrides.certificateEnabled ?? true,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    publishedAt: overrides.publishedAt ?? null,
    createdBy: overrides.createdBy ?? "admin@skillpath.local",
    updatedBy: overrides.updatedBy ?? "admin@skillpath.local",
    version: overrides.version ?? 1,
    visibility: overrides.visibility ?? "PUBLIC",
    difficulty: overrides.difficulty ?? "MEDIUM",
    seoTitle: overrides.seoTitle ?? title,
    seoDescription: overrides.seoDescription ?? overrides.shortDescription ?? "SEO description",
    certificateConfig: overrides.certificateConfig ?? {
      enabled: true,
      certificateTitle: `${title} Certificate`,
      certificateTemplate: "modern-dark",
      signatoryName: "SkillPath Academy",
      signatoryRole: "Head of Learning",
      logoUrl: "",
      certificateText: "Awarded for successful course completion.",
      issuanceConditions: ["Complete all required modules", "Pass final assessments"],
    },
  };
}

function makeModule(courseId: string, order: number, title: string, color: string): CourseModule {
  return {
    id: createId("module"),
    courseId,
    title,
    description: `${title} module description`,
    order,
    estimatedDuration: 90,
    status: order === 1 ? "PUBLISHED" : "DRAFT",
    unlockRule: defaultUnlockRule(),
    prerequisiteIds: [],
    xpReward: 120,
    visibility: "PUBLIC",
    icon: "layers-3",
    themeColor: color,
  };
}

function makeLesson(moduleId: string, order: number, title: string): CourseLesson {
  return {
    id: createId("lesson"),
    moduleId,
    title,
    description: `${title} lesson`,
    order,
    estimatedDuration: 30,
    status: "DRAFT",
    blocks: [defaultLessonBlock("heading", 1), defaultLessonBlock("paragraph", 2), defaultLessonBlock("task_block", 3)],
    xpReward: 30,
    visibility: "PUBLIC",
    tags: [],
    draftDirty: false,
  };
}

function makeQuiz(moduleId: string, title: string): CourseQuiz {
  return {
    id: createId("quiz"),
    moduleId,
    title,
    description: `${title} quiz`,
    passingScore: 70,
    timeLimit: 20,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    explanationMode: "ON_SUBMIT",
    aiReviewEnabled: true,
    status: "DRAFT",
    questions: [
      {
        id: createId("question"),
        questionText: "What is the main goal of this module?",
        questionType: "SINGLE_CHOICE",
        options: [
          { id: "a", label: "A", value: "Understand fundamentals" },
          { id: "b", label: "B", value: "Skip learning" },
          { id: "c", label: "C", value: "Only memorization" },
        ],
        correctAnswer: ["a"],
        explanation: "Fundamentals set the base for practical tasks.",
        hint: "Think about learning outcomes.",
        difficulty: "EASY",
        tags: ["fundamentals"],
        points: 10,
        aiExplanationEnabled: true,
      },
    ],
  };
}

function makeAssignment(moduleId: string, title: string): CourseAssignment {
  return {
    id: createId("assignment"),
    moduleId,
    assignmentType: "TEXT_TASK",
    title,
    instructions: "Describe your solution approach in 5-8 bullet points.",
    expectedOutput: "Structured explanation with examples.",
    evaluationCriteria: ["Completeness", "Logic", "Accuracy"],
    hints: ["Use module terminology", "Provide one real-world example"],
    attachments: [],
    maxScore: 100,
    estimatedTime: 35,
    aiReviewEnabled: true,
    status: "DRAFT",
    tags: ["practice"],
  };
}

function makeSimulation(moduleId: string, title: string): CourseSimulation {
  return {
    id: createId("simulation"),
    moduleId,
    title,
    description: `${title} simulation`,
    simulationType: "SCENARIO_EXERCISE",
    scenario: "You are assigned to a sprint task and need to deliver a structured outcome.",
    steps: ["Read scenario", "Define actions", "Submit result"],
    expectedResult: "Clear, reproducible, and measurable output.",
    aiEvaluationEnabled: true,
    difficulty: "MEDIUM",
    estimatedTime: 40,
    xpReward: 140,
    status: "DRAFT",
  };
}

function makeCaseStudy(moduleId: string, title: string): CourseCaseStudy {
  return {
    id: createId("case"),
    moduleId,
    title,
    summary: `${title} case summary`,
    problemStatement: "Analyze the case and propose a practical action plan.",
    materials: ["Brief", "Dataset", "Constraints"],
    questions: ["What is the root cause?", "What should be done first?"],
    expectedApproach: "Hypothesis -> validation -> recommendation.",
    outcome: "Operational action plan with measurable KPIs.",
    tags: ["case", "analysis"],
    difficulty: "MEDIUM",
    status: "DRAFT",
  };
}

function makeAnalytics(courseId: string, modules: CourseModule[]): CourseAnalyticsSnapshot {
  return {
    courseId,
    enrolledUsers: 24,
    completionRate: 37,
    averageQuizScore: 74,
    averageAssignmentScore: 79,
    averageTimeSpentMin: 312,
    mostDifficultModule: modules[1]?.title ?? modules[0]?.title ?? "Module",
    topFailedQuizQuestions: ["API edge cases", "SQL joins case question"],
    dropOffPoints: ["Module 2 lesson 3", "Final quiz"],
    mostSkippedLesson: "Advanced checklist",
    progressByModule: modules.map((moduleItem, index) => ({
      moduleId: moduleItem.id,
      label: moduleItem.title,
      completion: Math.max(12, 70 - index * 14),
    })),
  };
}

function createCourseEntity(input: {
  title: string;
  short: string;
  category: Course["category"];
  color: string;
  status: Course["status"];
}): CourseStudioEntity {
  const course = baseCourse({
    title: input.title,
    shortTitle: input.short,
    shortDescription: `${input.short} practical course`,
    description: `${input.title} end-to-end program with lessons, quizzes, assignments, and simulations.`,
    category: input.category,
    status: input.status,
    themeColor: input.color,
    tags: [input.category.toLowerCase(), "academy-studio"],
    outcomes: ["Build practical competency", "Deliver real-world artifacts", "Pass final assessment"],
    requirements: ["Basic product understanding", "Weekly study time 4-6 hours"],
    targetAudience: "Students switching to IT and junior specialists.",
  });

  const moduleA = makeModule(course.id, 1, `${input.short} Foundations`, input.color);
  const moduleB = makeModule(course.id, 2, `${input.short} Workflow`, input.color);
  const moduleC = makeModule(course.id, 3, `${input.short} Advanced Practice`, input.color);
  const modules = [moduleA, moduleB, moduleC];

  const lessons: CourseLesson[] = [
    makeLesson(moduleA.id, 1, "Introduction"),
    makeLesson(moduleA.id, 2, "Core concepts"),
    makeLesson(moduleB.id, 1, "Execution pattern"),
    makeLesson(moduleC.id, 1, "Capstone walkthrough"),
  ];

  const quizzes = [makeQuiz(moduleA.id, `${input.short} Fundamentals Quiz`), makeQuiz(moduleC.id, "Final checkpoint")];
  const assignments = [makeAssignment(moduleB.id, "Practical assignment: workflow artifact")];
  const simulations = [makeSimulation(moduleC.id, `${input.short} Scenario Simulation`)];
  const cases = [makeCaseStudy(moduleC.id, `${input.short} Real-world case`)];

  const versions = [
    {
      id: createId("version"),
      version: 1,
      updatedBy: "admin@skillpath.local",
      updatedAt: nowIso(),
      changelogNote: "Initial course scaffolding created in Academy Studio.",
      snapshot: {
        status: course.status,
        title: course.title,
        moduleCount: modules.length,
        lessonCount: lessons.length,
        quizCount: quizzes.length,
      },
    },
  ];

  return {
    course,
    modules,
    lessons,
    quizzes,
    assignments,
    simulations,
    cases,
    versions,
    analytics: makeAnalytics(course.id, modules),
  };
}

export function buildSeedCourses(): CourseStudioEntity[] {
  return [
    createCourseEntity({
      title: "QA Mastery Sprint",
      short: "QA Sprint",
      category: "QA",
      color: "#34d399",
      status: "IN_REVIEW",
    }),
    createCourseEntity({
      title: "Business Analysis Launchpad",
      short: "BA Launchpad",
      category: "BA",
      color: "#fb923c",
      status: "DRAFT",
    }),
    createCourseEntity({
      title: "Data Analytics Career Path",
      short: "DA Path",
      category: "DA",
      color: "#a78bfa",
      status: "PUBLISHED",
    }),
  ];
}

export function buildSeedTemplates(courses: CourseStudioEntity[]): CourseTemplate[] {
  const now = nowIso();
  return [
    {
      id: createId("tpl"),
      title: "QA course template",
      description: "Testing-focused program with bug tracker simulation and API checks.",
      category: "QA",
      sourceCourseId: courses[0]?.course.id ?? null,
      createdAt: now,
      blueprint: { modules: 5, lessonsPerModule: 3, quizzes: 5, assignments: 3, simulations: 2, cases: 2 },
      tags: ["qa", "automation", "api"],
    },
    {
      id: createId("tpl"),
      title: "BA course template",
      description: "Stakeholder to user-story workflow with review gates.",
      category: "BA",
      sourceCourseId: courses[1]?.course.id ?? null,
      createdAt: now,
      blueprint: { modules: 4, lessonsPerModule: 3, quizzes: 4, assignments: 4, simulations: 1, cases: 2 },
      tags: ["ba", "requirements", "workshop"],
    },
    {
      id: createId("tpl"),
      title: "DA course template",
      description: "SQL + analytics + dashboard storytelling curriculum.",
      category: "DA",
      sourceCourseId: courses[2]?.course.id ?? null,
      createdAt: now,
      blueprint: { modules: 5, lessonsPerModule: 3, quizzes: 5, assignments: 4, simulations: 2, cases: 3 },
      tags: ["da", "sql", "analytics"],
    },
    {
      id: createId("tpl"),
      title: "Short intensive template",
      description: "2-week fast track for onboarding or sprint bootcamps.",
      category: "PRODUCT",
      sourceCourseId: null,
      createdAt: now,
      blueprint: { modules: 2, lessonsPerModule: 4, quizzes: 2, assignments: 2, simulations: 1, cases: 1 },
      tags: ["intensive", "short"],
    },
    {
      id: createId("tpl"),
      title: "Corporate training template",
      description: "Enterprise cohort template with review and analytics checkpoints.",
      category: "MANAGEMENT",
      sourceCourseId: null,
      createdAt: now,
      blueprint: { modules: 6, lessonsPerModule: 2, quizzes: 3, assignments: 3, simulations: 2, cases: 2 },
      tags: ["corporate", "lms"],
    },
  ];
}

export function buildSeedMedia(): MediaAsset[] {
  const now = nowIso();
  return [
    {
      id: createId("media"),
      name: "qa-cover-hero.png",
      type: "image",
      sizeKb: 420,
      url: "https://placehold.co/1200x630",
      uploadedAt: now,
      tags: ["cover", "qa"],
    },
    {
      id: createId("media"),
      name: "module-checklist.pdf",
      type: "file",
      sizeKb: 180,
      url: "https://example.local/module-checklist.pdf",
      uploadedAt: now,
      tags: ["materials", "pdf"],
    },
  ];
}

export function buildSeedActivityLog(): AdminActivityLog[] {
  const now = nowIso();
  return [
    {
      id: createId("act"),
      actorEmail: "admin@skillpath.local",
      actorRole: "SUPER_ADMIN",
      action: "create",
      entityType: "course",
      entityId: "seed",
      timestamp: now,
      note: "Initialized Academy Studio seed data.",
    },
  ];
}
