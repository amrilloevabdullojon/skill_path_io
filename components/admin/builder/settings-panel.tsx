"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Rocket, Sparkles, Upload } from "lucide-react";

import { BuilderSelection } from "@/types/builder/builder-ui";
import { CourseStatus, CourseStudioEntity } from "@/types/builder/course-builder";
import { AdminAiRequest, AdminAiResponse, AdminAiTool } from "@/types/admin/ai";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";
import { StudioStatusBadge } from "@/components/admin/studio-status-badge";

type SettingsPanelProps = {
  entity: CourseStudioEntity;
  selected: BuilderSelection;
  canWrite: boolean;
  canPublish: boolean;
};

const aiTools: Array<{ value: AdminAiTool; label: string }> = [
  { value: "generate_course_description", label: "Generate course description" },
  { value: "generate_learning_outcomes", label: "Generate learning outcomes" },
  { value: "generate_module_outline", label: "Generate module outline" },
  { value: "generate_lesson_draft", label: "Generate lesson draft" },
  { value: "improve_lesson_text", label: "Improve lesson text" },
  { value: "simplify_for_beginners", label: "Simplify for beginners" },
  { value: "generate_quiz_questions", label: "Generate quiz questions" },
  { value: "generate_assignment", label: "Generate assignment" },
  { value: "generate_case_study", label: "Generate case study" },
  { value: "generate_tags", label: "Generate tags" },
];

function toStatus(value: string): CourseStatus {
  if (value === "IN_REVIEW" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }
  return "DRAFT";
}

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCsv(values: string[]) {
  return values.join(", ");
}

export function SettingsPanel({ entity, selected, canWrite, canPublish }: SettingsPanelProps) {
  const setCourseStatus = useCourseBuilderStore((state) => state.setCourseStatus);
  const updateCourse = useCourseBuilderStore((state) => state.updateCourse);
  const updateModule = useCourseBuilderStore((state) => state.updateModule);
  const updateLesson = useCourseBuilderStore((state) => state.updateLesson);
  const updateQuiz = useCourseBuilderStore((state) => state.updateQuiz);
  const updateAssignment = useCourseBuilderStore((state) => state.updateAssignment);
  const updateSimulation = useCourseBuilderStore((state) => state.updateSimulation);
  const updateCase = useCourseBuilderStore((state) => state.updateCase);
  const addVersion = useCourseBuilderStore((state) => state.addVersion);

  const [versionNote, setVersionNote] = useState("Builder update");
  const [tool, setTool] = useState<AdminAiTool>("generate_course_description");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>("");
  const [aiSource, setAiSource] = useState<"mock" | "anthropic" | null>(null);

  const moduleItem = selected.type === "module" ? entity.modules.find((item) => item.id === selected.id) : null;
  const lesson = selected.type === "lesson" ? entity.lessons.find((item) => item.id === selected.id) : null;
  const quiz = selected.type === "quiz" ? entity.quizzes.find((item) => item.id === selected.id) : null;
  const assignment = selected.type === "assignment" ? entity.assignments.find((item) => item.id === selected.id) : null;
  const simulation = selected.type === "simulation" ? entity.simulations.find((item) => item.id === selected.id) : null;
  const caseStudy = selected.type === "case" ? entity.cases.find((item) => item.id === selected.id) : null;

  const currentStatus = useMemo(() => {
    if (selected.type === "course") return entity.course.status;
    if (selected.type === "module") return moduleItem?.status ?? "DRAFT";
    if (selected.type === "lesson") return lesson?.status ?? "DRAFT";
    if (selected.type === "quiz") return quiz?.status ?? "DRAFT";
    if (selected.type === "assignment") return assignment?.status ?? "DRAFT";
    if (selected.type === "simulation") return simulation?.status ?? "DRAFT";
    return caseStudy?.status ?? "DRAFT";
  }, [selected.type, entity.course.status, moduleItem?.status, lesson?.status, quiz?.status, assignment?.status, simulation?.status, caseStudy?.status]);

  function updateStatus(status: CourseStatus) {
    if (!canWrite) return;
    if (selected.type === "course") {
      if (!canPublish && status === "PUBLISHED") {
        return;
      }
      setCourseStatus(entity.course.id, status);
      return;
    }
    if (selected.type === "module" && moduleItem) {
      if (!canPublish && status === "PUBLISHED") return;
      updateModule(moduleItem.id, { status });
      return;
    }
    if (selected.type === "lesson" && lesson) {
      if (!canPublish && status === "PUBLISHED") return;
      updateLesson(lesson.id, { status });
      return;
    }
    if (selected.type === "quiz" && quiz) {
      if (!canPublish && status === "PUBLISHED") return;
      updateQuiz(quiz.id, { status });
      return;
    }
    if (selected.type === "assignment" && assignment) {
      if (!canPublish && status === "PUBLISHED") return;
      updateAssignment(assignment.id, { status });
      return;
    }
    if (selected.type === "simulation" && simulation) {
      if (!canPublish && status === "PUBLISHED") return;
      updateSimulation(simulation.id, { status });
      return;
    }
    if (selected.type === "case" && caseStudy) {
      if (!canPublish && status === "PUBLISHED") return;
      updateCase(caseStudy.id, { status });
    }
  }

  async function runAiTool() {
    setIsLoading(true);
    setAiResult("");
    setAiSource(null);
    try {
      const payload: AdminAiRequest = {
        tool,
        prompt: customPrompt || undefined,
        context: {
          courseTitle: entity.course.title,
          moduleTitle: moduleItem?.title,
          lessonTitle: lesson?.title,
          description: entity.course.shortDescription,
          content: lesson?.blocks?.map((block) => block.content).join("\n") || lesson?.description || entity.course.description,
          tags: entity.course.tags,
        },
      };
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("AI generation failed");
      }
      const data = (await response.json()) as AdminAiResponse;
      setAiResult(data.result);
      setAiSource(data.source);
    } catch {
      setAiResult("AI response is currently unavailable. Try a simpler prompt.");
      setAiSource("mock");
    } finally {
      setIsLoading(false);
    }
  }

  function applyAiResult() {
    if (!canWrite || !aiResult.trim()) return;
    if (selected.type === "course") {
      if (tool === "generate_tags") {
        updateCourse(entity.course.id, { tags: parseCsv(aiResult) });
      } else if (tool === "generate_learning_outcomes") {
        updateCourse(entity.course.id, { outcomes: parseCsv(aiResult) });
      } else {
        updateCourse(entity.course.id, { description: aiResult });
      }
      return;
    }
    if (selected.type === "module" && moduleItem) {
      updateModule(moduleItem.id, { description: aiResult });
      return;
    }
    if (selected.type === "lesson" && lesson) {
      updateLesson(lesson.id, { description: aiResult, draftDirty: true });
      return;
    }
    if (selected.type === "quiz" && quiz) {
      updateQuiz(quiz.id, { description: aiResult });
      return;
    }
    if (selected.type === "assignment" && assignment) {
      updateAssignment(assignment.id, { instructions: aiResult });
      return;
    }
    if (selected.type === "simulation" && simulation) {
      updateSimulation(simulation.id, { scenario: aiResult });
      return;
    }
    if (selected.type === "case" && caseStudy) {
      updateCase(caseStudy.id, { problemStatement: aiResult });
    }
  }

  return (
    <aside className="surface-elevated space-y-4 p-4 xl:sticky xl:top-24 xl:h-[calc(100vh-150px)] xl:overflow-y-auto">
      <section className="space-y-2">
        <p className="kicker">Publish workflow</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Current status</span>
          <StudioStatusBadge status={currentStatus} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => updateStatus("DRAFT")} disabled={!canWrite}>Draft</button>
          <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => updateStatus("IN_REVIEW")} disabled={!canWrite}>In review</button>
          <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => updateStatus("PUBLISHED")} disabled={!canWrite || !canPublish}>Publish</button>
          <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => updateStatus("ARCHIVED")} disabled={!canWrite}>Archive</button>
        </div>
        {!canPublish ? (
          <p className="text-xs text-amber-300">This role cannot publish. Send content to review.</p>
        ) : null}
      </section>

      {selected.type === "course" ? (
        <section className="space-y-3">
          <p className="kicker">Meta and visibility</p>
          <input className="input-base h-9" value={entity.course.slug} onChange={(event) => updateCourse(entity.course.id, { slug: event.target.value })} disabled={!canWrite} placeholder="Slug" />
          <input className="input-base h-9" value={entity.course.language} onChange={(event) => updateCourse(entity.course.id, { language: event.target.value as "ru" | "en" })} disabled={!canWrite} placeholder="Language" />
          <input className="input-base h-9" value={toCsv(entity.course.tags)} onChange={(event) => updateCourse(entity.course.id, { tags: parseCsv(event.target.value) })} disabled={!canWrite} placeholder="Tags" />
          <select className="select-base h-9" value={entity.course.difficulty} onChange={(event) => updateCourse(entity.course.id, { difficulty: event.target.value as "EASY" | "MEDIUM" | "HARD" })} disabled={!canWrite}>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
          <input className="input-base h-9" type="number" min={0} value={entity.course.estimatedDuration} onChange={(event) => updateCourse(entity.course.id, { estimatedDuration: Number(event.target.value) || 0 })} disabled={!canWrite} placeholder="Estimated duration (min)" />
          <input className="input-base h-9" value={entity.course.seoTitle} onChange={(event) => updateCourse(entity.course.id, { seoTitle: event.target.value })} disabled={!canWrite} placeholder="SEO title" />
          <textarea className="textarea-base min-h-[76px]" value={entity.course.seoDescription} onChange={(event) => updateCourse(entity.course.id, { seoDescription: event.target.value })} disabled={!canWrite} placeholder="SEO description" />
          <label className="surface-subtle flex items-center gap-2 p-3 text-sm text-slate-300">
            <input type="checkbox" checked={entity.course.featured} onChange={(event) => updateCourse(entity.course.id, { featured: event.target.checked })} disabled={!canWrite} className="h-4 w-4 accent-sky-400" />
            Featured course
          </label>
          <label className="surface-subtle flex items-center gap-2 p-3 text-sm text-slate-300">
            <input type="checkbox" checked={entity.course.certificateConfig.enabled} onChange={(event) => updateCourse(entity.course.id, { certificateConfig: { ...entity.course.certificateConfig, enabled: event.target.checked } })} disabled={!canWrite} className="h-4 w-4 accent-sky-400" />
            Certificate enabled
          </label>
          <Link href={`/admin/courses/${entity.course.id}/preview`} className="btn-secondary inline-flex w-full items-center justify-center gap-2">
            <Rocket className="h-4 w-4" />
            Preview as student
          </Link>
        </section>
      ) : null}

      {selected.type === "module" && moduleItem ? (
        <section className="space-y-3">
          <p className="kicker">Unlock logic</p>
          <input
            className="input-base h-9"
            value={moduleItem.prerequisiteIds.join(", ")}
            onChange={(event) => updateModule(moduleItem.id, { prerequisiteIds: parseCsv(event.target.value) })}
            disabled={!canWrite}
            placeholder="Prerequisite module ids"
          />
          <label className="surface-subtle flex items-center gap-2 p-3 text-sm text-slate-300">
            <input type="checkbox" checked={moduleItem.unlockRule.unlockAfterQuizPass} onChange={(event) => updateModule(moduleItem.id, { unlockRule: { ...moduleItem.unlockRule, unlockAfterQuizPass: event.target.checked } })} disabled={!canWrite} className="h-4 w-4 accent-sky-400" />
            Unlock after quiz pass
          </label>
          <label className="surface-subtle flex items-center gap-2 p-3 text-sm text-slate-300">
            <input type="checkbox" checked={moduleItem.unlockRule.unlockAfterAssignmentCompletion} onChange={(event) => updateModule(moduleItem.id, { unlockRule: { ...moduleItem.unlockRule, unlockAfterAssignmentCompletion: event.target.checked } })} disabled={!canWrite} className="h-4 w-4 accent-sky-400" />
            Unlock after assignment completion
          </label>
          <input
            className="input-base h-9"
            type="number"
            min={0}
            value={moduleItem.unlockRule.minScoreToUnlock ?? 0}
            onChange={(event) => updateModule(moduleItem.id, { unlockRule: { ...moduleItem.unlockRule, minScoreToUnlock: Number(event.target.value) || null } })}
            disabled={!canWrite}
            placeholder="Minimum score to unlock"
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="kicker">Version history</p>
        <input className="input-base h-9" value={versionNote} onChange={(event) => setVersionNote(event.target.value)} disabled={!canWrite} placeholder="Changelog note" />
        <button type="button" className="btn-secondary w-full gap-2" onClick={() => addVersion(entity.course.id, versionNote)} disabled={!canWrite}>
          <Upload className="h-4 w-4" />
          Save version snapshot
        </button>
        <div className="space-y-1">
          {entity.versions.slice(0, 4).map((version) => (
            <div key={version.id} className="surface-subtle p-2.5 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">v{version.version}</p>
              <p className="text-slate-400">{version.changelogNote}</p>
              <p className="text-slate-500">{new Date(version.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          Restore and diff flow is scaffolded via snapshots and can be wired to Prisma rollback endpoints later.
        </p>
      </section>

      <section className="space-y-3">
        <p className="kicker">AI assistant</p>
        <select className="select-base h-9" value={tool} onChange={(event) => setTool(event.target.value as AdminAiTool)} disabled={isLoading}>
          {aiTools.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <textarea
          className="textarea-base min-h-[90px]"
          value={customPrompt}
          onChange={(event) => setCustomPrompt(event.target.value)}
          placeholder="Optional custom prompt"
          disabled={isLoading}
        />
        <button type="button" className="btn-primary w-full gap-2" onClick={runAiTool} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </button>
        {aiResult ? (
          <div className="surface-subtle space-y-2 p-3">
            <p className="text-xs text-slate-500">Source: {aiSource ?? "mock"}</p>
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap text-xs text-slate-200">{aiResult}</pre>
            <button type="button" className="btn-secondary w-full" onClick={applyAiResult} disabled={!canWrite}>
              Apply to editor
            </button>
          </div>
        ) : null}
      </section>
    </aside>
  );
}
