import { CourseStudioEntity } from "@/types/builder/course-builder";
import { TrackSeed } from "@/lib/data/tracks";
import {
  RuntimeCategory,
  RuntimeCourse,
  RuntimeLesson,
  RuntimeLessonBlock,
  RuntimeLevel,
  RuntimeModule,
  RuntimeQuestion,
  RuntimeQuiz,
  RuntimeStatus,
  RuntimeVisibility,
} from "@/lib/learning/content-types";

export type PrismaTrackRuntimeInput = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  modules: Array<{
    id: string;
    order: number;
    title: string;
    description: string;
    duration: number;
    content: unknown;
    lessons: Array<{
      id: string;
      order: number;
      title: string;
      body: string;
      type: string;
    }>;
    quiz: {
      id: string;
      title: string;
      passingScore: number;
      questions: Array<{
        id: string;
        text: string;
        type: string;
        options: unknown;
        correctAnswer: unknown;
      }>;
    } | null;
  }>;
};

type PrismaCourseRuntimeInput = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  category: string;
  level: string;
  estimatedDuration: number;
  status: string;
  visibility?: string;
  tags?: unknown;
  icon?: string;
  themeColor?: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    estimatedDuration: number;
    status: string;
    visibility: string;
    xpReward: number;
    unlockRule: unknown;
    lessons: Array<{
      id: string;
      moduleId: string;
      title: string;
      description: string;
      order: number;
      estimatedDuration: number;
      status: string;
      blocks: Array<{
        id: string;
        type: string;
        content: string;
        order: number;
        config: unknown;
      }>;
    }>;
    quizzes: Array<{
      id: string;
      title: string;
      description: string;
      passingScore: number;
      status: string;
      questions: Array<{
        id: string;
        questionText: string;
        questionType: string;
        options: unknown;
        correctAnswer: unknown;
      }>;
    }>;
    assignments: Array<{
      id: string;
      title: string;
      instructions: string;
      expectedOutput: string;
      maxScore: number;
      status: string;
      difficulty?: string;
    }>;
    simulations: Array<{
      id: string;
      title: string;
      description: string;
      simulationType: string;
      xpReward: number;
      difficulty: string;
      status: string;
    }>;
  }>;
};

function normalizeCategory(value: unknown): RuntimeCategory {
  if (value === "QA" || value === "BA" || value === "DA") {
    return value;
  }
  if (value === "PRODUCT" || value === "MANAGEMENT") {
    return value;
  }
  return "GENERAL";
}

function normalizeStatus(value: unknown, fallback: RuntimeStatus): RuntimeStatus {
  if (value === "DRAFT" || value === "IN_REVIEW" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }
  return fallback;
}

function normalizeVisibility(value: unknown): RuntimeVisibility {
  if (value === "PRIVATE" || value === "HIDDEN") {
    return value;
  }
  return "PUBLIC";
}

function normalizeLevel(value: unknown, fallback: RuntimeLevel = "UNKNOWN"): RuntimeLevel {
  if (value === "BEGINNER" || value === "JUNIOR" || value === "INTERMEDIATE" || value === "ADVANCED") {
    return value;
  }
  return fallback;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseQuizOptions(value: unknown): Array<{ id: string; text: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((option, index) => {
      if (typeof option === "string") {
        return {
          id: `opt-${index + 1}`,
          text: option,
        };
      }
      if (typeof option === "object" && option !== null) {
        const raw = option as Record<string, unknown>;
        const text = typeof raw.text === "string" ? raw.text : "";
        if (!text) {
          return null;
        }
        return {
          id: typeof raw.id === "string" && raw.id.trim() ? raw.id : `opt-${index + 1}`,
          text,
        };
      }
      return null;
    })
    .filter((option): option is { id: string; text: string } => option !== null);
}

function buildRuntimeQuestion(input: {
  id: string;
  text: string;
  type: string;
  options: unknown;
  correctAnswer: unknown;
}): RuntimeQuestion {
  return {
    id: input.id,
    text: input.text,
    type: input.type,
    options: parseQuizOptions(input.options),
    correctAnswer: toStringArray(input.correctAnswer),
  };
}

function defaultContentForModule(description: string): Record<string, unknown> {
  return {
    overview: description,
    outcomes: [],
    resources: [],
  };
}

function buildRuntimeLessonFromPrisma(input: {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  description?: string;
  body: string;
  type: string;
}): RuntimeLesson {
  return {
    id: input.id,
    moduleId: input.moduleId,
    order: input.order,
    title: input.title,
    description: input.description ?? "",
    body: input.body,
    lessonType: input.type,
    estimatedDuration: 20,
    status: "PUBLISHED",
    blocks: [],
  };
}

function buildRuntimeQuiz(input: {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  passingScore: number;
  status?: string;
  questions: Array<{
    id: string;
    text?: string;
    questionText?: string;
    type?: string;
    questionType?: string;
    options: unknown;
    correctAnswer: unknown;
  }>;
}): RuntimeQuiz {
  return {
    id: input.id,
    moduleId: input.moduleId,
    title: input.title,
    description: input.description ?? "",
    passingScore: input.passingScore,
    status: normalizeStatus(input.status, "PUBLISHED"),
    questions: input.questions.map((question) =>
      buildRuntimeQuestion({
        id: question.id,
        text: question.text ?? question.questionText ?? "",
        type: question.type ?? question.questionType ?? "SINGLE",
        options: question.options,
        correctAnswer: question.correctAnswer,
      }),
    ),
  };
}

function categoryFromSeedSlug(slug: string): RuntimeCategory {
  if (slug.includes("qa")) {
    return "QA";
  }
  if (slug.includes("business")) {
    return "BA";
  }
  if (slug.includes("data")) {
    return "DA";
  }
  return "GENERAL";
}

export function adaptSeedTrackToRuntimeCourse(track: TrackSeed): RuntimeCourse {
  const estimatedDuration = track.durationWeeks * 60 * 3;

  const modules: RuntimeModule[] = track.modules.map((moduleItem) => ({
    id: moduleItem.id,
    courseId: track.id,
    order: moduleItem.order,
    title: moduleItem.title,
    description: moduleItem.description,
    estimatedDuration: Math.max(30, Math.round(estimatedDuration / Math.max(track.modules.length, 1))),
    xpReward: 100,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    content: defaultContentForModule(moduleItem.description),
    lessons: [],
    quiz: null,
    missions: [],
    simulations: [],
  }));

  return {
    id: track.id,
    slug: track.slug,
    title: track.title,
    shortTitle: track.title,
    description: track.description,
    shortDescription: track.description,
    category: categoryFromSeedSlug(track.slug),
    level: track.level === "Middle" ? "INTERMEDIATE" : "JUNIOR",
    estimatedDuration,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    source: "seed-track",
    tags: [],
    icon: "",
    color: "",
    modules,
  };
}

export function adaptPrismaTrackToRuntimeCourse(track: PrismaTrackRuntimeInput): RuntimeCourse {
  const modules: RuntimeModule[] = [...track.modules]
    .sort((a, b) => a.order - b.order)
    .map((moduleItem) => {
      const lessons = [...moduleItem.lessons]
        .sort((a, b) => a.order - b.order)
        .map((lesson) =>
          buildRuntimeLessonFromPrisma({
            id: lesson.id,
            moduleId: moduleItem.id,
            order: lesson.order,
            title: lesson.title,
            body: lesson.body,
            type: lesson.type,
          }),
        );

      const quiz = moduleItem.quiz
        ? buildRuntimeQuiz({
            id: moduleItem.quiz.id,
            moduleId: moduleItem.id,
            title: moduleItem.quiz.title,
            passingScore: moduleItem.quiz.passingScore,
            status: "PUBLISHED",
            questions: moduleItem.quiz.questions,
          })
        : null;

      return {
        id: moduleItem.id,
        courseId: track.id,
        order: moduleItem.order,
        title: moduleItem.title,
        description: moduleItem.description,
        estimatedDuration: moduleItem.duration,
        xpReward: 120,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        content: toRecord(moduleItem.content),
        lessons,
        quiz,
        missions: [],
        simulations: [],
      };
    });

  return {
    id: track.id,
    slug: track.slug,
    title: track.title,
    shortTitle: track.title,
    description: track.description,
    shortDescription: track.description,
    category: normalizeCategory(track.category),
    level: "JUNIOR",
    estimatedDuration: modules.reduce((sum, moduleItem) => sum + moduleItem.estimatedDuration, 0),
    status: "PUBLISHED",
    visibility: "PUBLIC",
    source: "prisma-track",
    tags: [],
    icon: track.icon,
    color: track.color,
    modules,
  };
}

export function adaptPrismaCourseToRuntimeCourse(course: PrismaCourseRuntimeInput): RuntimeCourse {
  const modules: RuntimeModule[] = [...course.modules]
    .sort((a, b) => a.order - b.order)
    .map((moduleItem) => {
      const lessons: RuntimeLesson[] = [...moduleItem.lessons]
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({
          id: lesson.id,
          moduleId: moduleItem.id,
          order: lesson.order,
          title: lesson.title,
          description: lesson.description,
          body: lesson.description,
          lessonType: "TEXT",
          estimatedDuration: lesson.estimatedDuration,
          status: normalizeStatus(lesson.status, "DRAFT"),
          blocks: [...lesson.blocks]
            .sort((a, b) => a.order - b.order)
            .map(
              (block): RuntimeLessonBlock => ({
                id: block.id,
                type: block.type,
                content: block.content,
                order: block.order,
                config: toRecord(block.config),
              }),
            ),
        }));

      const firstQuiz = moduleItem.quizzes[0];
      const quiz = firstQuiz
        ? buildRuntimeQuiz({
            id: firstQuiz.id,
            moduleId: moduleItem.id,
            title: firstQuiz.title,
            description: firstQuiz.description,
            passingScore: firstQuiz.passingScore,
            status: firstQuiz.status,
            questions: firstQuiz.questions,
          })
        : null;

      return {
        id: moduleItem.id,
        courseId: course.id,
        order: moduleItem.order,
        title: moduleItem.title,
        description: moduleItem.description,
        estimatedDuration: moduleItem.estimatedDuration,
        xpReward: moduleItem.xpReward,
        status: normalizeStatus(moduleItem.status, "DRAFT"),
        visibility: normalizeVisibility(moduleItem.visibility),
        content: toRecord(moduleItem.unlockRule),
        lessons,
        quiz,
        missions: moduleItem.assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          scenario: assignment.instructions,
          objective: assignment.expectedOutput,
          xpReward: Math.max(20, Math.round(assignment.maxScore * 0.6)),
          difficulty: assignment.difficulty ?? "MEDIUM",
          status: normalizeStatus(assignment.status, "DRAFT"),
        })),
        simulations: moduleItem.simulations.map((simulation) => ({
          id: simulation.id,
          title: simulation.title,
          description: simulation.description,
          simulationType: simulation.simulationType,
          xpReward: simulation.xpReward,
          difficulty: simulation.difficulty,
          status: normalizeStatus(simulation.status, "DRAFT"),
        })),
      };
    });

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortTitle: course.shortTitle,
    description: course.description,
    shortDescription: course.shortDescription,
    category: normalizeCategory(course.category),
    level: normalizeLevel(course.level, "BEGINNER"),
    estimatedDuration: course.estimatedDuration,
    status: normalizeStatus(course.status, "DRAFT"),
    visibility: normalizeVisibility(course.visibility),
    source: "prisma-course",
    tags: toStringArray(course.tags),
    icon: course.icon ?? "",
    color: course.themeColor ?? "",
    modules,
  };
}

export function adaptStudioEntityToRuntimeCourse(entity: CourseStudioEntity): RuntimeCourse {
  const prismaLikeCourse: PrismaCourseRuntimeInput = {
    id: entity.course.id,
    slug: entity.course.slug,
    title: entity.course.title,
    shortTitle: entity.course.shortTitle,
    description: entity.course.description,
    shortDescription: entity.course.shortDescription,
    category: entity.course.category,
    level: entity.course.level,
    estimatedDuration: entity.course.estimatedDuration,
    status: entity.course.status,
    visibility: entity.course.visibility,
    tags: entity.course.tags,
    icon: entity.course.icon,
    themeColor: entity.course.themeColor,
    modules: entity.modules.map((moduleItem) => ({
      id: moduleItem.id,
      title: moduleItem.title,
      description: moduleItem.description,
      order: moduleItem.order,
      estimatedDuration: moduleItem.estimatedDuration,
      status: moduleItem.status,
      visibility: moduleItem.visibility,
      xpReward: moduleItem.xpReward,
      unlockRule: moduleItem.unlockRule,
      lessons: entity.lessons
        .filter((lesson) => lesson.moduleId === moduleItem.id)
        .map((lesson) => ({
          id: lesson.id,
          moduleId: lesson.moduleId,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          estimatedDuration: lesson.estimatedDuration,
          status: lesson.status,
          blocks: lesson.blocks.map((block) => ({
            id: block.id,
            type: block.type,
            content: block.content,
            order: block.order,
            config: block.config,
          })),
        })),
      quizzes: entity.quizzes
        .filter((quiz) => quiz.moduleId === moduleItem.id)
        .map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          passingScore: quiz.passingScore,
          status: quiz.status,
          questions: quiz.questions.map((question) => ({
            id: question.id,
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options.map((option) => ({ id: option.id, text: option.value })),
            correctAnswer: Array.isArray(question.correctAnswer)
              ? question.correctAnswer
              : [String(question.correctAnswer)],
          })),
        })),
      assignments: entity.assignments
        .filter((assignment) => assignment.moduleId === moduleItem.id)
        .map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          instructions: assignment.instructions,
          expectedOutput: assignment.expectedOutput,
          maxScore: assignment.maxScore,
          status: assignment.status,
          difficulty: assignment.assignmentType,
        })),
      simulations: entity.simulations
        .filter((simulation) => simulation.moduleId === moduleItem.id)
        .map((simulation) => ({
          id: simulation.id,
          title: simulation.title,
          description: simulation.description,
          simulationType: simulation.simulationType,
          xpReward: simulation.xpReward,
          difficulty: simulation.difficulty,
          status: simulation.status,
        })),
    })),
  };

  const runtimeCourse = adaptPrismaCourseToRuntimeCourse(prismaLikeCourse);
  return {
    ...runtimeCourse,
    source: "studio-course",
  };
}

