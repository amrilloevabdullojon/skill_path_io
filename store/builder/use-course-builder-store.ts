/**
 * @deprecated Import from "@/store/admin/use-course-builder-store" instead.
 * This file is the canonical implementation but all consumers should use
 * the store/admin/ path as the stable public interface.
 */
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  Course,
  CourseAssignment,
  CourseCaseStudy,
  CourseLesson,
  CourseModule,
  CourseQuestion,
  CourseQuiz,
  CourseSimulation,
  CourseStatus,
  CourseStudioEntity,
  CourseTemplate,
  LessonBlockType,
  MediaAsset,
} from "@/types/builder/course-builder";
import {
  BUILDER_PERSIST_KEY,
  getBuilderStorage,
} from "@/lib/admin/builder-persistence";
import { createId, defaultLessonBlock, defaultUnlockRule, nowIso, reorderByIndex, slugify, sortByOrder } from "@/lib/course-builder/helpers";
import { buildSeedCourses, buildSeedMedia, buildSeedTemplates } from "@/lib/course-builder/seeds";
import { BuilderSelection } from "@/types/builder/builder-ui";

type BulkAction = "publish" | "archive" | "delete" | "duplicate";

type StoreState = {
  courses: CourseStudioEntity[];
  templates: CourseTemplate[];
  mediaAssets: MediaAsset[];
  selected: BuilderSelection | null;
  setSelected: (selection: BuilderSelection | null) => void;
  createCourse: (payload: Partial<Course>) => string;
  updateCourse: (courseId: string, patch: Partial<Course>) => void;
  duplicateCourse: (courseId: string) => string | null;
  deleteCourse: (courseId: string) => void;
  setCourseStatus: (courseId: string, status: CourseStatus) => void;
  addModule: (courseId: string) => string | null;
  updateModule: (moduleId: string, patch: Partial<CourseModule>) => void;
  duplicateModule: (moduleId: string) => string | null;
  deleteModule: (moduleId: string) => void;
  reorderModules: (courseId: string, from: number, to: number) => void;
  addLesson: (moduleId: string) => string | null;
  updateLesson: (lessonId: string, patch: Partial<CourseLesson>) => void;
  deleteLesson: (lessonId: string) => void;
  addLessonBlock: (lessonId: string, type: LessonBlockType) => string | null;
  updateLessonBlock: (
    lessonId: string,
    blockId: string,
    patch: Partial<{
      type: LessonBlockType;
      content: string;
      config: Record<string, unknown>;
      collapsed: boolean;
    }>,
  ) => void;
  duplicateLessonBlock: (lessonId: string, blockId: string) => string | null;
  deleteLessonBlock: (lessonId: string, blockId: string) => void;
  reorderLessonBlock: (lessonId: string, from: number, to: number) => void;
  toggleLessonBlockCollapsed: (lessonId: string, blockId: string) => void;
  addQuiz: (moduleId: string) => string | null;
  updateQuiz: (quizId: string, patch: Partial<CourseQuiz>) => void;
  deleteQuiz: (quizId: string) => void;
  addQuizQuestion: (quizId: string) => string | null;
  updateQuizQuestion: (quizId: string, questionId: string, patch: Partial<CourseQuestion>) => void;
  duplicateQuizQuestion: (quizId: string, questionId: string) => string | null;
  deleteQuizQuestion: (quizId: string, questionId: string) => void;
  reorderQuizQuestions: (quizId: string, from: number, to: number) => void;
  addAssignment: (moduleId: string) => string | null;
  updateAssignment: (assignmentId: string, patch: Partial<CourseAssignment>) => void;
  deleteAssignment: (assignmentId: string) => void;
  addSimulation: (moduleId: string) => string | null;
  updateSimulation: (simulationId: string, patch: Partial<CourseSimulation>) => void;
  deleteSimulation: (simulationId: string) => void;
  addCase: (moduleId: string) => string | null;
  updateCase: (caseId: string, patch: Partial<CourseCaseStudy>) => void;
  deleteCase: (caseId: string) => void;
  saveAsTemplate: (courseId: string) => void;
  createFromTemplate: (templateId: string) => string | null;
  addMediaAsset: (asset: MediaAsset) => void;
  removeMediaAsset: (assetId: string) => void;
  exportCourse: (courseId: string) => CourseStudioEntity | null;
  importCourses: (entities: CourseStudioEntity[]) => void;
  bulkCourseAction: (courseIds: string[], action: BulkAction) => void;
  bulkUpdateCourseTags: (courseIds: string[], tags: string[]) => void;
  addVersion: (courseId: string, note: string) => void;
};

const seedCourses = buildSeedCourses();

function updateEntity(
  courses: CourseStudioEntity[],
  predicate: (entity: CourseStudioEntity) => boolean,
  update: (entity: CourseStudioEntity) => CourseStudioEntity,
) {
  return courses.map((entity) => (predicate(entity) ? update(entity) : entity));
}

export const useCourseBuilderStore = create<StoreState>()(
  persist(
    (set, get) => ({
      courses: seedCourses,
      templates: buildSeedTemplates(seedCourses),
      mediaAssets: buildSeedMedia(),
      selected: null,

      setSelected: (selection) => set({ selected: selection }),

      createCourse: (payload) => {
        const now = nowIso();
        const title = payload.title?.trim() || "Untitled course";
        const id = createId("course");
        const entity: CourseStudioEntity = {
          course: {
            id,
            slug: slugify(payload.slug || title),
            title,
            shortTitle: payload.shortTitle || title,
            description: payload.description || "",
            shortDescription: payload.shortDescription || "",
            category: payload.category || "QA",
            level: payload.level || "BEGINNER",
            language: payload.language || "ru",
            coverImage: payload.coverImage || "",
            icon: payload.icon || "book-open",
            themeColor: payload.themeColor || "#38bdf8",
            estimatedDuration: payload.estimatedDuration || 240,
            tags: payload.tags || [],
            outcomes: payload.outcomes || [],
            requirements: payload.requirements || [],
            targetAudience: payload.targetAudience || "",
            status: "DRAFT",
            featured: Boolean(payload.featured),
            certificateEnabled: true,
            createdAt: now,
            updatedAt: now,
            publishedAt: null,
            createdBy: "admin@skillpath.local",
            updatedBy: "admin@skillpath.local",
            version: 1,
            visibility: payload.visibility || "PUBLIC",
            difficulty: payload.difficulty || "MEDIUM",
            seoTitle: payload.seoTitle || title,
            seoDescription: payload.seoDescription || payload.shortDescription || "",
            certificateConfig: {
              enabled: true,
              certificateTitle: `${title} Certificate`,
              certificateTemplate: "modern-dark",
              signatoryName: "SkillPath Academy",
              signatoryRole: "Head of Learning",
              logoUrl: "",
              certificateText: "Awarded for successful completion.",
              issuanceConditions: ["Complete all required content"],
            },
          },
          modules: [],
          lessons: [],
          quizzes: [],
          assignments: [],
          simulations: [],
          cases: [],
          versions: [
            {
              id: createId("version"),
              version: 1,
              updatedBy: "admin@skillpath.local",
              updatedAt: now,
              changelogNote: "Course created",
              snapshot: {
                status: "DRAFT",
                title,
                moduleCount: 0,
                lessonCount: 0,
                quizCount: 0,
              },
            },
          ],
          analytics: {
            courseId: id,
            enrolledUsers: 0,
            completionRate: 0,
            averageQuizScore: 0,
            averageAssignmentScore: 0,
            averageTimeSpentMin: 0,
            mostDifficultModule: "N/A",
            topFailedQuizQuestions: [],
            dropOffPoints: [],
            mostSkippedLesson: "N/A",
            progressByModule: [],
          },
        };

        set((state) => ({
          courses: [entity, ...state.courses],
          selected: { type: "course", id },
        }));
        return id;
      },

      updateCourse: (courseId, patch) =>
        set((state) => ({
          courses: updateEntity(
            state.courses,
            (entity) => entity.course.id === courseId,
            (entity) => ({
              ...entity,
              course: {
                ...entity.course,
                ...patch,
                slug: patch.slug ? slugify(patch.slug) : entity.course.slug,
                updatedAt: nowIso(),
                updatedBy: "admin@skillpath.local",
              },
            }),
          ),
        })),

      duplicateCourse: (courseId) => {
        const source = get().courses.find((entity) => entity.course.id === courseId);
        if (!source) {
          return null;
        }

        const moduleIdMap = new Map<string, string>();
        const newCourseId = createId("course");
        const modules = source.modules.map((moduleItem) => {
          const newId = createId("module");
          moduleIdMap.set(moduleItem.id, newId);
          return { ...moduleItem, id: newId, courseId: newCourseId };
        });

        const clone: CourseStudioEntity = {
          ...source,
          course: {
            ...source.course,
            id: newCourseId,
            title: `${source.course.title} (Copy)`,
            shortTitle: `${source.course.shortTitle} Copy`,
            slug: slugify(`${source.course.slug}-${Date.now().toString().slice(-4)}`),
            status: "DRAFT",
            featured: false,
            version: 1,
            createdAt: nowIso(),
            updatedAt: nowIso(),
            publishedAt: null,
          },
          modules,
          lessons: source.lessons.map((lesson) => ({
            ...lesson,
            id: createId("lesson"),
            moduleId: moduleIdMap.get(lesson.moduleId) ?? lesson.moduleId,
            blocks: lesson.blocks.map((block) => ({ ...block, id: createId("block") })),
          })),
          quizzes: source.quizzes.map((quiz) => ({
            ...quiz,
            id: createId("quiz"),
            moduleId: moduleIdMap.get(quiz.moduleId) ?? quiz.moduleId,
            questions: quiz.questions.map((q) => ({ ...q, id: createId("question") })),
          })),
          assignments: source.assignments.map((assignment) => ({
            ...assignment,
            id: createId("assignment"),
            moduleId: moduleIdMap.get(assignment.moduleId) ?? assignment.moduleId,
          })),
          simulations: source.simulations.map((simulation) => ({
            ...simulation,
            id: createId("simulation"),
            moduleId: moduleIdMap.get(simulation.moduleId) ?? simulation.moduleId,
          })),
          cases: source.cases.map((caseItem) => ({
            ...caseItem,
            id: createId("case"),
            moduleId: moduleIdMap.get(caseItem.moduleId) ?? caseItem.moduleId,
          })),
          versions: [
            {
              id: createId("version"),
              version: 1,
              updatedBy: "admin@skillpath.local",
              updatedAt: nowIso(),
              changelogNote: "Duplicated from another course",
              snapshot: {
                status: "DRAFT",
                title: `${source.course.title} (Copy)`,
                moduleCount: source.modules.length,
                lessonCount: source.lessons.length,
                quizCount: source.quizzes.length,
              },
            },
          ],
          analytics: {
            ...source.analytics,
            courseId: newCourseId,
            completionRate: 0,
            enrolledUsers: 0,
          },
        };
        set((state) => ({ courses: [clone, ...state.courses], selected: { type: "course", id: newCourseId } }));
        return newCourseId;
      },

      deleteCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((entity) => entity.course.id !== courseId),
          selected: state.selected?.id === courseId ? null : state.selected,
        })),

      setCourseStatus: (courseId, status) =>
        set((state) => ({
          courses: updateEntity(
            state.courses,
            (entity) => entity.course.id === courseId,
            (entity) => ({
              ...entity,
              course: {
                ...entity.course,
                status,
                updatedAt: nowIso(),
                publishedAt: status === "PUBLISHED" ? nowIso() : entity.course.publishedAt,
              },
            }),
          ),
        })),

      addModule: (courseId) => {
        const entity = get().courses.find((item) => item.course.id === courseId);
        if (!entity) {
          return null;
        }
        const id = createId("module");
        const moduleItem: CourseModule = {
          id,
          courseId,
          title: `Module ${entity.modules.length + 1}`,
          description: "",
          order: entity.modules.length + 1,
          estimatedDuration: 60,
          status: "DRAFT",
          unlockRule: defaultUnlockRule(),
          prerequisiteIds: [],
          xpReward: 100,
          visibility: "PUBLIC",
          icon: "layers-3",
          themeColor: entity.course.themeColor,
        };
        set((state) => ({
          courses: updateEntity(state.courses, (item) => item.course.id === courseId, (item) => ({
            ...item,
            modules: [...item.modules, moduleItem],
          })),
          selected: { type: "module", id },
        }));
        return id;
      },

      updateModule: (moduleId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            modules: entity.modules.map((moduleItem) =>
              moduleItem.id === moduleId ? { ...moduleItem, ...patch } : moduleItem,
            ),
          })),
        })),

      duplicateModule: (moduleId) => {
        let newId: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => {
            const source = entity.modules.find((moduleItem) => moduleItem.id === moduleId);
            if (!source) {
              return entity;
            }
            newId = createId("module");
            return {
              ...entity,
              modules: [
                ...entity.modules,
                { ...source, id: newId, title: `${source.title} (Copy)`, order: entity.modules.length + 1 },
              ],
            };
          }),
          selected: newId ? { type: "module", id: newId } : state.selected,
        }));
        return newId;
      },

      deleteModule: (moduleId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            modules: entity.modules
              .filter((moduleItem) => moduleItem.id !== moduleId)
              .map((moduleItem, index) => ({ ...moduleItem, order: index + 1 })),
            lessons: entity.lessons.filter((lesson) => lesson.moduleId !== moduleId),
            quizzes: entity.quizzes.filter((quiz) => quiz.moduleId !== moduleId),
            assignments: entity.assignments.filter((assignment) => assignment.moduleId !== moduleId),
            simulations: entity.simulations.filter((simulation) => simulation.moduleId !== moduleId),
            cases: entity.cases.filter((caseItem) => caseItem.moduleId !== moduleId),
          })),
        })),

      reorderModules: (courseId, from, to) =>
        set((state) => ({
          courses: updateEntity(state.courses, (entity) => entity.course.id === courseId, (entity) => ({
            ...entity,
            modules: reorderByIndex(sortByOrder(entity.modules), from, to).map((moduleItem, index) => ({
              ...moduleItem,
              order: index + 1,
            })),
          })),
        })),

      addLesson: (moduleId) => {
        let lessonId: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => {
            if (!entity.modules.some((moduleItem) => moduleItem.id === moduleId)) {
              return entity;
            }
            const order = entity.lessons.filter((lesson) => lesson.moduleId === moduleId).length + 1;
            lessonId = createId("lesson");
            return {
              ...entity,
              lessons: [
                ...entity.lessons,
                {
                  id: lessonId,
                  moduleId,
                  title: `Lesson ${order}`,
                  description: "",
                  order,
                  estimatedDuration: 25,
                  status: "DRAFT",
                  blocks: [defaultLessonBlock("heading", 1), defaultLessonBlock("paragraph", 2)],
                  xpReward: 30,
                  visibility: "PUBLIC",
                  tags: [],
                  draftDirty: true,
                },
              ],
            };
          }),
          selected: lessonId ? { type: "lesson", id: lessonId } : state.selected,
        }));
        return lessonId;
      },

      updateLesson: (lessonId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...patch } : lesson)),
          })),
        })),

      deleteLesson: (lessonId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.filter((lesson) => lesson.id !== lessonId),
          })),
        })),

      addLessonBlock: (lessonId, type) => {
        let newBlockId: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.map((lesson) => {
              if (lesson.id !== lessonId) {
                return lesson;
              }
              const order = lesson.blocks.length + 1;
              const block = defaultLessonBlock(type, order);
              newBlockId = block.id;
              return {
                ...lesson,
                blocks: [...lesson.blocks, block],
                draftDirty: true,
              };
            }),
          })),
        }));
        return newBlockId;
      },

      updateLessonBlock: (lessonId, blockId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.map((lesson) => {
              if (lesson.id !== lessonId) {
                return lesson;
              }
              return {
                ...lesson,
                blocks: lesson.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
                draftDirty: true,
              };
            }),
          })),
        })),

      duplicateLessonBlock: (lessonId, blockId) => {
        let clonedId: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.map((lesson) => {
              if (lesson.id !== lessonId) {
                return lesson;
              }
              const source = lesson.blocks.find((block) => block.id === blockId);
              if (!source) {
                return lesson;
              }
              clonedId = createId("block");
              const cloned = {
                ...source,
                id: clonedId,
                order: lesson.blocks.length + 1,
              };
              return {
                ...lesson,
                blocks: [...lesson.blocks, cloned],
                draftDirty: true,
              };
            }),
          })),
        }));
        return clonedId;
      },

      deleteLessonBlock: (lessonId, blockId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.map((lesson) => {
              if (lesson.id !== lessonId) {
                return lesson;
              }
              return {
                ...lesson,
                blocks: lesson.blocks
                  .filter((block) => block.id !== blockId)
                  .map((block, index) => ({ ...block, order: index + 1 })),
                draftDirty: true,
              };
            }),
          })),
        })),

      reorderLessonBlock: (lessonId, from, to) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.map((lesson) => {
              if (lesson.id !== lessonId) {
                return lesson;
              }
              return {
                ...lesson,
                blocks: reorderByIndex(sortByOrder(lesson.blocks), from, to).map((block, index) => ({
                  ...block,
                  order: index + 1,
                })),
                draftDirty: true,
              };
            }),
          })),
        })),

      toggleLessonBlockCollapsed: (lessonId, blockId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            lessons: entity.lessons.map((lesson) => {
              if (lesson.id !== lessonId) {
                return lesson;
              }
              return {
                ...lesson,
                blocks: lesson.blocks.map((block) =>
                  block.id === blockId ? { ...block, collapsed: !block.collapsed } : block,
                ),
              };
            }),
          })),
        })),

      addQuiz: (moduleId) => {
        let quizId: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => {
            if (!entity.modules.some((moduleItem) => moduleItem.id === moduleId)) {
              return entity;
            }
            quizId = createId("quiz");
            return {
              ...entity,
              quizzes: [
                ...entity.quizzes,
                {
                  id: quizId,
                  moduleId,
                  title: "New quiz",
                  description: "",
                  passingScore: 70,
                  timeLimit: null,
                  maxAttempts: 3,
                  shuffleQuestions: true,
                  shuffleOptions: true,
                  explanationMode: "ON_SUBMIT",
                  aiReviewEnabled: true,
                  status: "DRAFT",
                  questions: [],
                },
              ],
            };
          }),
          selected: quizId ? { type: "quiz", id: quizId } : state.selected,
        }));
        return quizId;
      },

      updateQuiz: (quizId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            quizzes: entity.quizzes.map((quiz) => (quiz.id === quizId ? { ...quiz, ...patch } : quiz)),
          })),
        })),

      deleteQuiz: (quizId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            quizzes: entity.quizzes.filter((quiz) => quiz.id !== quizId),
          })),
        })),

      addQuizQuestion: (quizId) => {
        let questionId: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            quizzes: entity.quizzes.map((quiz) => {
              if (quiz.id !== quizId) {
                return quiz;
              }
              questionId = createId("question");
              return {
                ...quiz,
                questions: [
                  ...quiz.questions,
                  {
                    id: questionId,
                    questionText: "New question",
                    questionType: "SINGLE_CHOICE",
                    options: [
                      { id: createId("opt"), label: "A", value: "Option A" },
                      { id: createId("opt"), label: "B", value: "Option B" },
                      { id: createId("opt"), label: "C", value: "Option C" },
                    ],
                    correctAnswer: [],
                    explanation: "",
                    hint: "",
                    difficulty: "MEDIUM",
                    tags: [],
                    points: 10,
                    aiExplanationEnabled: true,
                  },
                ],
              };
            }),
          })),
        }));
        return questionId;
      },

      updateQuizQuestion: (quizId, questionId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            quizzes: entity.quizzes.map((quiz) => {
              if (quiz.id !== quizId) {
                return quiz;
              }
              return {
                ...quiz,
                questions: quiz.questions.map((question) =>
                  question.id === questionId ? { ...question, ...patch } : question,
                ),
              };
            }),
          })),
        })),

      duplicateQuizQuestion: (quizId, questionId) => {
        let duplicatedId: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            quizzes: entity.quizzes.map((quiz) => {
              if (quiz.id !== quizId) {
                return quiz;
              }
              const source = quiz.questions.find((question) => question.id === questionId);
              if (!source) {
                return quiz;
              }
              duplicatedId = createId("question");
              return {
                ...quiz,
                questions: [
                  ...quiz.questions,
                  {
                    ...source,
                    id: duplicatedId,
                    questionText: `${source.questionText} (Copy)`,
                    options: source.options.map((option) => ({ ...option, id: createId("opt") })),
                  },
                ],
              };
            }),
          })),
        }));
        return duplicatedId;
      },

      deleteQuizQuestion: (quizId, questionId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            quizzes: entity.quizzes.map((quiz) => {
              if (quiz.id !== quizId) {
                return quiz;
              }
              return {
                ...quiz,
                questions: quiz.questions.filter((question) => question.id !== questionId),
              };
            }),
          })),
        })),

      reorderQuizQuestions: (quizId, from, to) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            quizzes: entity.quizzes.map((quiz) => {
              if (quiz.id !== quizId) {
                return quiz;
              }
              return {
                ...quiz,
                questions: reorderByIndex(quiz.questions, from, to),
              };
            }),
          })),
        })),

      addAssignment: (moduleId) => {
        let id: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => {
            if (!entity.modules.some((moduleItem) => moduleItem.id === moduleId)) {
              return entity;
            }
            id = createId("assignment");
            return {
              ...entity,
              assignments: [
                ...entity.assignments,
                {
                  id,
                  moduleId,
                  assignmentType: "TEXT_TASK",
                  title: "New assignment",
                  instructions: "",
                  expectedOutput: "",
                  evaluationCriteria: [],
                  hints: [],
                  attachments: [],
                  maxScore: 100,
                  estimatedTime: 30,
                  aiReviewEnabled: true,
                  status: "DRAFT",
                  tags: [],
                },
              ],
            };
          }),
          selected: id ? { type: "assignment", id } : state.selected,
        }));
        return id;
      },

      updateAssignment: (assignmentId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            assignments: entity.assignments.map((assignment) =>
              assignment.id === assignmentId ? { ...assignment, ...patch } : assignment,
            ),
          })),
        })),

      deleteAssignment: (assignmentId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            assignments: entity.assignments.filter((assignment) => assignment.id !== assignmentId),
          })),
        })),

      addSimulation: (moduleId) => {
        let id: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => {
            if (!entity.modules.some((moduleItem) => moduleItem.id === moduleId)) {
              return entity;
            }
            id = createId("simulation");
            return {
              ...entity,
              simulations: [
                ...entity.simulations,
                {
                  id,
                  moduleId,
                  title: "New simulation",
                  description: "",
                  simulationType: "SCENARIO_EXERCISE",
                  scenario: "",
                  steps: [],
                  expectedResult: "",
                  aiEvaluationEnabled: true,
                  difficulty: "MEDIUM",
                  estimatedTime: 35,
                  xpReward: 120,
                  status: "DRAFT",
                },
              ],
            };
          }),
          selected: id ? { type: "simulation", id } : state.selected,
        }));
        return id;
      },

      updateSimulation: (simulationId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            simulations: entity.simulations.map((simulation) =>
              simulation.id === simulationId ? { ...simulation, ...patch } : simulation,
            ),
          })),
        })),

      deleteSimulation: (simulationId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            simulations: entity.simulations.filter((simulation) => simulation.id !== simulationId),
          })),
        })),

      addCase: (moduleId) => {
        let id: string | null = null;
        set((state) => ({
          courses: state.courses.map((entity) => {
            if (!entity.modules.some((moduleItem) => moduleItem.id === moduleId)) {
              return entity;
            }
            id = createId("case");
            return {
              ...entity,
              cases: [
                ...entity.cases,
                {
                  id,
                  moduleId,
                  title: "New case",
                  summary: "",
                  problemStatement: "",
                  materials: [],
                  questions: [],
                  expectedApproach: "",
                  outcome: "",
                  tags: [],
                  difficulty: "MEDIUM",
                  status: "DRAFT",
                },
              ],
            };
          }),
          selected: id ? { type: "case", id } : state.selected,
        }));
        return id;
      },

      updateCase: (caseId, patch) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            cases: entity.cases.map((caseItem) => (caseItem.id === caseId ? { ...caseItem, ...patch } : caseItem)),
          })),
        })),

      deleteCase: (caseId) =>
        set((state) => ({
          courses: state.courses.map((entity) => ({
            ...entity,
            cases: entity.cases.filter((caseItem) => caseItem.id !== caseId),
          })),
        })),

      saveAsTemplate: (courseId) => {
        const entity = get().courses.find((item) => item.course.id === courseId);
        if (!entity) {
          return;
        }
        const template: CourseTemplate = {
          id: createId("tpl"),
          title: `${entity.course.shortTitle} template`,
          description: entity.course.shortDescription || "Saved template",
          category: entity.course.category,
          sourceCourseId: courseId,
          createdAt: nowIso(),
          blueprint: {
            modules: entity.modules.length,
            lessonsPerModule: entity.modules.length > 0 ? Math.round(entity.lessons.length / entity.modules.length) : 0,
            quizzes: entity.quizzes.length,
            assignments: entity.assignments.length,
            simulations: entity.simulations.length,
            cases: entity.cases.length,
          },
          tags: entity.course.tags,
        };
        set((state) => ({ templates: [template, ...state.templates] }));
      },

      createFromTemplate: (templateId) => {
        const template = get().templates.find((item) => item.id === templateId);
        if (!template) {
          return null;
        }
        if (template.sourceCourseId) {
          const clonedId = get().duplicateCourse(template.sourceCourseId);
          if (clonedId) {
            get().updateCourse(clonedId, {
              title: `${template.title} course`,
              shortTitle: template.title,
              slug: slugify(`${template.title}-${Date.now().toString().slice(-4)}`),
              status: "DRAFT",
            });
          }
          return clonedId;
        }
        return get().createCourse({
          title: template.title,
          shortTitle: template.title,
          shortDescription: template.description,
          description: template.description,
          category: template.category,
        });
      },

      addMediaAsset: (asset) => set((state) => ({ mediaAssets: [asset, ...state.mediaAssets] })),
      removeMediaAsset: (assetId) =>
        set((state) => ({ mediaAssets: state.mediaAssets.filter((item) => item.id !== assetId) })),

      exportCourse: (courseId) => get().courses.find((entity) => entity.course.id === courseId) ?? null,
      importCourses: (entities) => set((state) => ({ courses: [...entities, ...state.courses] })),

      bulkCourseAction: (courseIds, action) => {
        if (action === "publish") {
          courseIds.forEach((courseId) => get().setCourseStatus(courseId, "PUBLISHED"));
          return;
        }
        if (action === "archive") {
          courseIds.forEach((courseId) => get().setCourseStatus(courseId, "ARCHIVED"));
          return;
        }
        if (action === "delete") {
          courseIds.forEach((courseId) => get().deleteCourse(courseId));
          return;
        }
        courseIds.forEach((courseId) => get().duplicateCourse(courseId));
      },

      bulkUpdateCourseTags: (courseIds, tags) =>
        set((state) => ({
          courses: state.courses.map((entity) =>
            courseIds.includes(entity.course.id)
              ? {
                  ...entity,
                  course: {
                    ...entity.course,
                    tags,
                    updatedAt: nowIso(),
                    updatedBy: "admin@skillpath.local",
                  },
                }
              : entity,
          ),
        })),

      addVersion: (courseId, note) =>
        set((state) => ({
          courses: updateEntity(state.courses, (entity) => entity.course.id === courseId, (entity) => {
            const nextVersion = (entity.versions[0]?.version ?? entity.course.version) + 1;
            return {
              ...entity,
              course: { ...entity.course, version: nextVersion, updatedAt: nowIso() },
              versions: [
                {
                  id: createId("version"),
                  version: nextVersion,
                  updatedBy: "admin@skillpath.local",
                  updatedAt: nowIso(),
                  changelogNote: note,
                  snapshot: {
                    status: entity.course.status,
                    title: entity.course.title,
                    moduleCount: entity.modules.length,
                    lessonCount: entity.lessons.length,
                    quizCount: entity.quizzes.length,
                  },
                },
                ...entity.versions,
              ],
            };
          }),
        })),
    }),
    {
      name: BUILDER_PERSIST_KEY,
      version: 1,
      storage: createJSONStorage(() => getBuilderStorage()),
      partialize: (state) => ({
        courses: state.courses,
        templates: state.templates,
        mediaAssets: state.mediaAssets,
      }),
    },
  ),
);
