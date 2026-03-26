"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import { StatePanel } from "@/components/ui/state-panel";
import { BuilderSelection } from "@/types/builder/builder-ui";
import {
  CourseStatus,
  CourseStudioEntity,
  LessonBlockType,
  QuestionKind,
  Visibility,
} from "@/types/builder/course-builder";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";
import { StudioStatusBadge } from "@/components/admin/studio-status-badge";

type MainEditorProps = {
  entity: CourseStudioEntity;
  selected: BuilderSelection;
  canWrite: boolean;
};

const blockTypes: LessonBlockType[] = [
  "heading",
  "subheading",
  "paragraph",
  "markdown",
  "bullet_list",
  "numbered_list",
  "checklist",
  "quote",
  "callout",
  "key_points",
  "common_mistakes",
  "important_note",
  "real_world_example",
  "table",
  "divider",
  "code_block",
  "image",
  "video_embed",
  "file_attachment",
  "faq_accordion",
  "task_block",
  "summary_block",
];

const statusOptions: CourseStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];
const visibilityOptions: Visibility[] = ["PUBLIC", "PRIVATE", "HIDDEN"];
const questionKinds: QuestionKind[] = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_ANSWER",
  "MATCH_PAIRS",
  "REORDER_STEPS",
  "CASE_BASED",
];

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCsv(values: string[]) {
  return values.join(", ");
}

function clientId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

export function MainEditor({ entity, selected, canWrite }: MainEditorProps) {
  const updateCourse = useCourseBuilderStore((state) => state.updateCourse);
  const updateModule = useCourseBuilderStore((state) => state.updateModule);
  const updateLesson = useCourseBuilderStore((state) => state.updateLesson);
  const addLessonBlock = useCourseBuilderStore((state) => state.addLessonBlock);
  const updateLessonBlock = useCourseBuilderStore((state) => state.updateLessonBlock);
  const duplicateLessonBlock = useCourseBuilderStore((state) => state.duplicateLessonBlock);
  const deleteLessonBlock = useCourseBuilderStore((state) => state.deleteLessonBlock);
  const reorderLessonBlock = useCourseBuilderStore((state) => state.reorderLessonBlock);
  const toggleLessonBlockCollapsed = useCourseBuilderStore((state) => state.toggleLessonBlockCollapsed);
  const updateQuiz = useCourseBuilderStore((state) => state.updateQuiz);
  const addQuizQuestion = useCourseBuilderStore((state) => state.addQuizQuestion);
  const updateQuizQuestion = useCourseBuilderStore((state) => state.updateQuizQuestion);
  const duplicateQuizQuestion = useCourseBuilderStore((state) => state.duplicateQuizQuestion);
  const deleteQuizQuestion = useCourseBuilderStore((state) => state.deleteQuizQuestion);
  const reorderQuizQuestions = useCourseBuilderStore((state) => state.reorderQuizQuestions);
  const updateAssignment = useCourseBuilderStore((state) => state.updateAssignment);
  const updateSimulation = useCourseBuilderStore((state) => state.updateSimulation);
  const updateCase = useCourseBuilderStore((state) => state.updateCase);

  const moduleItem = selected.type === "module" ? entity.modules.find((item) => item.id === selected.id) : null;
  const lesson = selected.type === "lesson" ? entity.lessons.find((item) => item.id === selected.id) : null;
  const quiz = selected.type === "quiz" ? entity.quizzes.find((item) => item.id === selected.id) : null;
  const assignment = selected.type === "assignment" ? entity.assignments.find((item) => item.id === selected.id) : null;
  const simulation = selected.type === "simulation" ? entity.simulations.find((item) => item.id === selected.id) : null;
  const caseStudy = selected.type === "case" ? entity.cases.find((item) => item.id === selected.id) : null;
  const currentStatus =
    selected.type === "course"
      ? entity.course.status
      : moduleItem?.status ?? lesson?.status ?? quiz?.status ?? assignment?.status ?? simulation?.status ?? caseStudy?.status ?? "DRAFT";

  const lessonPreview = useMemo(() => {
    if (!lesson) {
      return "";
    }
    return [...lesson.blocks]
      .sort((a, b) => a.order - b.order)
      .map((block) => {
        if (block.type === "divider") {
          return "---";
        }
        if (block.type === "heading") {
          return `# ${block.content}`;
        }
        if (block.type === "subheading") {
          return `## ${block.content}`;
        }
        return block.content;
      })
      .join("\n\n");
  }, [lesson]);

  return (
    <section className="surface-elevated space-y-4 p-4 sm:p-5 xl:min-h-[calc(100vh-160px)]">
      {!canWrite ? (
        <p className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Current role has read-only permissions for this section.
        </p>
      ) : null}

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Main editor</p>
          <h2 className="text-xl font-semibold text-foreground">{
            selected.type === "course"
              ? entity.course.title
              : moduleItem?.title ?? lesson?.title ?? quiz?.title ?? assignment?.title ?? simulation?.title ?? caseStudy?.title ?? "Select an entity"
          }</h2>
        </div>
        <StudioStatusBadge
          status={currentStatus}
        />
      </header>

      {canWrite && currentStatus === "PUBLISHED" ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          You are editing published content. Save a new version snapshot and review changes before keeping it published.
        </p>
      ) : null}

      {selected.type === "course" ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input-base" value={entity.course.title} onChange={(event) => updateCourse(entity.course.id, { title: event.target.value })} disabled={!canWrite} placeholder="Course title" />
            <input className="input-base" value={entity.course.shortTitle} onChange={(event) => updateCourse(entity.course.id, { shortTitle: event.target.value })} disabled={!canWrite} placeholder="Short title" />
            <input className="input-base" value={entity.course.slug} onChange={(event) => updateCourse(entity.course.id, { slug: event.target.value })} disabled={!canWrite} placeholder="Slug" />
            <input className="input-base" value={entity.course.themeColor} onChange={(event) => updateCourse(entity.course.id, { themeColor: event.target.value })} disabled={!canWrite} placeholder="Theme color" />
            <select className="select-base" value={entity.course.status} onChange={(event) => updateCourse(entity.course.id, { status: event.target.value as CourseStatus })} disabled={!canWrite}>
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select className="select-base" value={entity.course.visibility} onChange={(event) => updateCourse(entity.course.id, { visibility: event.target.value as Visibility })} disabled={!canWrite}>
              {visibilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <textarea className="textarea-base min-h-[110px]" value={entity.course.shortDescription} onChange={(event) => updateCourse(entity.course.id, { shortDescription: event.target.value })} disabled={!canWrite} placeholder="Short description" />
          <textarea className="textarea-base min-h-[150px]" value={entity.course.description} onChange={(event) => updateCourse(entity.course.id, { description: event.target.value })} disabled={!canWrite} placeholder="Description" />
          <input className="input-base" value={toCsv(entity.course.tags)} onChange={(event) => updateCourse(entity.course.id, { tags: parseCsv(event.target.value) })} disabled={!canWrite} placeholder="Tags, separated by comma" />
        </div>
      ) : null}

      {selected.type === "module" ? (
        moduleItem ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input-base" value={moduleItem.title} onChange={(event) => updateModule(moduleItem.id, { title: event.target.value })} disabled={!canWrite} />
              <input className="input-base" type="number" min={1} value={moduleItem.estimatedDuration} onChange={(event) => updateModule(moduleItem.id, { estimatedDuration: Number(event.target.value) || 0 })} disabled={!canWrite} />
              <select className="select-base" value={moduleItem.status} onChange={(event) => updateModule(moduleItem.id, { status: event.target.value as CourseStatus })} disabled={!canWrite}>
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <input className="input-base" type="number" min={0} value={moduleItem.xpReward} onChange={(event) => updateModule(moduleItem.id, { xpReward: Number(event.target.value) || 0 })} disabled={!canWrite} />
            </div>
            <textarea className="textarea-base min-h-[120px]" value={moduleItem.description} onChange={(event) => updateModule(moduleItem.id, { description: event.target.value })} disabled={!canWrite} />
          </div>
        ) : <StatePanel title="Module not found" description="Select another module in structure tree." />
      ) : null}

      {selected.type === "lesson" ? (
        lesson ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input-base" value={lesson.title} onChange={(event) => updateLesson(lesson.id, { title: event.target.value, draftDirty: true })} disabled={!canWrite} />
              <input className="input-base" type="number" min={1} value={lesson.estimatedDuration} onChange={(event) => updateLesson(lesson.id, { estimatedDuration: Number(event.target.value) || 0, draftDirty: true })} disabled={!canWrite} />
            </div>
            <textarea className="textarea-base min-h-[90px]" value={lesson.description} onChange={(event) => updateLesson(lesson.id, { description: event.target.value, draftDirty: true })} disabled={!canWrite} />
            <div className="flex flex-wrap gap-1.5">
              {blockTypes.slice(0, 10).map((type) => (
                <button key={type} type="button" onClick={() => addLessonBlock(lesson.id, type)} className="btn-secondary px-2 py-1 text-xs" disabled={!canWrite}><Plus className="mr-1 h-3.5 w-3.5" />{type}</button>
              ))}
            </div>
            <div className="space-y-2">
              {[...lesson.blocks].sort((a, b) => a.order - b.order).map((block, index) => (
                <article key={block.id} className="surface-subtle space-y-2 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Block {index + 1} - {block.type}</p>
                    <div className="flex gap-1">
                      <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => toggleLessonBlockCollapsed(lesson.id, block.id)} disabled={!canWrite}>{block.collapsed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                      <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => reorderLessonBlock(lesson.id, index, index - 1)} disabled={!canWrite || index === 0}><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => reorderLessonBlock(lesson.id, index, index + 1)} disabled={!canWrite || index === lesson.blocks.length - 1}><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => duplicateLessonBlock(lesson.id, block.id)} disabled={!canWrite}><Copy className="h-3.5 w-3.5" /></button>
                      <button type="button" className="btn-destructive px-2 py-1 text-xs" onClick={() => deleteLessonBlock(lesson.id, block.id)} disabled={!canWrite}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {!block.collapsed ? (
                    <div className="space-y-2">
                      <select className="select-base h-9" value={block.type} onChange={(event) => updateLessonBlock(lesson.id, block.id, { type: event.target.value as LessonBlockType })} disabled={!canWrite}>
                        {blockTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <textarea className="textarea-base min-h-[90px]" value={block.content} onChange={(event) => updateLessonBlock(lesson.id, block.id, { content: event.target.value })} disabled={!canWrite} />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
            <section className="surface-subtle p-4">
              <p className="kicker">Lesson preview</p>
              <article className="markdown-content mt-3">
                <ReactMarkdown>{lessonPreview || "No content yet."}</ReactMarkdown>
              </article>
            </section>
          </div>
        ) : <StatePanel title="Lesson not found" description="Select another lesson in structure tree." />
      ) : null}

      {selected.type === "quiz" ? (
        quiz ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input-base" value={quiz.title} onChange={(event) => updateQuiz(quiz.id, { title: event.target.value })} disabled={!canWrite} />
              <input className="input-base" type="number" min={1} max={100} value={quiz.passingScore} onChange={(event) => updateQuiz(quiz.id, { passingScore: Number(event.target.value) || 0 })} disabled={!canWrite} />
              <input className="input-base" type="number" min={0} value={quiz.timeLimit ?? 0} onChange={(event) => updateQuiz(quiz.id, { timeLimit: Number(event.target.value) || null })} disabled={!canWrite} />
              <input className="input-base" type="number" min={1} value={quiz.maxAttempts} onChange={(event) => updateQuiz(quiz.id, { maxAttempts: Number(event.target.value) || 1 })} disabled={!canWrite} />
            </div>
            <textarea className="textarea-base min-h-[90px]" value={quiz.description} onChange={(event) => updateQuiz(quiz.id, { description: event.target.value })} disabled={!canWrite} />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Questions</p>
              <button type="button" className="btn-primary px-3 py-2 text-xs" onClick={() => addQuizQuestion(quiz.id)} disabled={!canWrite}><Plus className="mr-1 h-3.5 w-3.5" />Add question</button>
            </div>
            {quiz.questions.length === 0 ? (
              <StatePanel title="No quiz questions yet" description="Add at least one question before publishing." />
            ) : (
              <div className="space-y-2">
                {quiz.questions.map((question, index) => (
                  <article key={question.id} className="surface-subtle space-y-2 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Question {index + 1}</p>
                      <div className="flex gap-1">
                        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => reorderQuizQuestions(quiz.id, index, index - 1)} disabled={!canWrite || index === 0}><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => reorderQuizQuestions(quiz.id, index, index + 1)} disabled={!canWrite || index === quiz.questions.length - 1}><ArrowDown className="h-3.5 w-3.5" /></button>
                        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => duplicateQuizQuestion(quiz.id, question.id)} disabled={!canWrite}><Copy className="h-3.5 w-3.5" /></button>
                        <button type="button" className="btn-destructive px-2 py-1 text-xs" onClick={() => deleteQuizQuestion(quiz.id, question.id)} disabled={!canWrite}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <textarea className="textarea-base min-h-[80px]" value={question.questionText} onChange={(event) => updateQuizQuestion(quiz.id, question.id, { questionText: event.target.value })} disabled={!canWrite} />
                    <div className="grid gap-2 md:grid-cols-2">
                      <select className="select-base h-9" value={question.questionType} onChange={(event) => updateQuizQuestion(quiz.id, question.id, { questionType: event.target.value as QuestionKind })} disabled={!canWrite}>
                        {questionKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
                      </select>
                      <input className="input-base h-9" type="number" min={1} value={question.points} onChange={(event) => updateQuizQuestion(quiz.id, question.id, { points: Number(event.target.value) || 1 })} disabled={!canWrite} />
                    </div>
                    <input className="input-base h-9" value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join(",") : question.correctAnswer} onChange={(event) => updateQuizQuestion(quiz.id, question.id, { correctAnswer: parseCsv(event.target.value) })} disabled={!canWrite} placeholder="Correct option ids, ex: A,C" />
                    <div className="space-y-1.5">
                      {question.options.map((option) => (
                        <div key={option.id} className="grid gap-1.5 sm:grid-cols-[70px_1fr]">
                          <input className="input-base h-9" value={option.label} onChange={(event) => updateQuizQuestion(quiz.id, question.id, { options: question.options.map((item) => item.id === option.id ? { ...item, label: event.target.value } : item) })} disabled={!canWrite} />
                          <input className="input-base h-9" value={option.value} onChange={(event) => updateQuizQuestion(quiz.id, question.id, { options: question.options.map((item) => item.id === option.id ? { ...item, value: event.target.value } : item) })} disabled={!canWrite} />
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => updateQuizQuestion(quiz.id, question.id, { options: [...question.options, { id: clientId("opt"), label: String.fromCharCode(65 + question.options.length), value: "New option" }] })} disabled={!canWrite}><Plus className="mr-1 h-3.5 w-3.5" />Add option</button>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : <StatePanel title="Quiz not found" description="Select another quiz in structure tree." />
      ) : null}

      {selected.type === "assignment" ? (
        assignment ? (
          <div className="space-y-3">
            <input className="input-base" value={assignment.title} onChange={(event) => updateAssignment(assignment.id, { title: event.target.value })} disabled={!canWrite} />
            <textarea className="textarea-base min-h-[110px]" value={assignment.instructions} onChange={(event) => updateAssignment(assignment.id, { instructions: event.target.value })} disabled={!canWrite} placeholder="Instructions" />
            <textarea className="textarea-base min-h-[90px]" value={assignment.expectedOutput} onChange={(event) => updateAssignment(assignment.id, { expectedOutput: event.target.value })} disabled={!canWrite} placeholder="Expected output" />
            <div className="grid gap-2 md:grid-cols-2">
              <input className="input-base" type="number" min={1} value={assignment.maxScore} onChange={(event) => updateAssignment(assignment.id, { maxScore: Number(event.target.value) || 0 })} disabled={!canWrite} />
              <input className="input-base" value={toCsv(assignment.tags)} onChange={(event) => updateAssignment(assignment.id, { tags: parseCsv(event.target.value) })} disabled={!canWrite} placeholder="Tags" />
            </div>
          </div>
        ) : <StatePanel title="Assignment not found" description="Select another assignment in structure tree." />
      ) : null}

      {selected.type === "simulation" ? (
        simulation ? (
          <div className="space-y-3">
            <input className="input-base" value={simulation.title} onChange={(event) => updateSimulation(simulation.id, { title: event.target.value })} disabled={!canWrite} />
            <textarea className="textarea-base min-h-[90px]" value={simulation.description} onChange={(event) => updateSimulation(simulation.id, { description: event.target.value })} disabled={!canWrite} placeholder="Description" />
            <textarea className="textarea-base min-h-[110px]" value={simulation.scenario} onChange={(event) => updateSimulation(simulation.id, { scenario: event.target.value })} disabled={!canWrite} placeholder="Scenario" />
            <textarea className="textarea-base min-h-[110px]" value={simulation.steps.join("\n")} onChange={(event) => updateSimulation(simulation.id, { steps: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} disabled={!canWrite} placeholder="Each line is one step" />
            <textarea className="textarea-base min-h-[90px]" value={simulation.expectedResult} onChange={(event) => updateSimulation(simulation.id, { expectedResult: event.target.value })} disabled={!canWrite} placeholder="Expected result" />
          </div>
        ) : <StatePanel title="Simulation not found" description="Select another simulation in structure tree." />
      ) : null}

      {selected.type === "case" ? (
        caseStudy ? (
          <div className="space-y-3">
            <input className="input-base" value={caseStudy.title} onChange={(event) => updateCase(caseStudy.id, { title: event.target.value })} disabled={!canWrite} />
            <textarea className="textarea-base min-h-[90px]" value={caseStudy.summary} onChange={(event) => updateCase(caseStudy.id, { summary: event.target.value })} disabled={!canWrite} placeholder="Summary" />
            <textarea className="textarea-base min-h-[110px]" value={caseStudy.problemStatement} onChange={(event) => updateCase(caseStudy.id, { problemStatement: event.target.value })} disabled={!canWrite} placeholder="Problem statement" />
            <textarea className="textarea-base min-h-[110px]" value={caseStudy.expectedApproach} onChange={(event) => updateCase(caseStudy.id, { expectedApproach: event.target.value })} disabled={!canWrite} placeholder="Expected approach" />
            <textarea className="textarea-base min-h-[90px]" value={caseStudy.outcome} onChange={(event) => updateCase(caseStudy.id, { outcome: event.target.value })} disabled={!canWrite} placeholder="Outcome" />
          </div>
        ) : <StatePanel title="Case not found" description="Select another case in structure tree." />
      ) : null}
    </section>
  );
}
