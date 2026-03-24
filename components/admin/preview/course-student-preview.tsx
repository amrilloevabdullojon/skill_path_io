"use client";

import { useMemo, useState } from "react";
import { Eye, Lock, Unlock } from "lucide-react";

import { StudioStatusBadge } from "@/components/admin/studio-status-badge";
import { StatePanel } from "@/components/ui/state-panel";
import { mapStudioCourseToUnifiedTrack } from "@/lib/learning/content-bridge";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

type CourseStudentPreviewProps = {
  courseId: string;
};

export function CourseStudentPreview({ courseId }: CourseStudentPreviewProps) {
  const [previewMode, setPreviewMode] = useState<"edit" | "student">("student");
  const entity = useCourseBuilderStore((state) => state.courses.find((item) => item.course.id === courseId));
  const unified = useMemo(() => (entity ? mapStudioCourseToUnifiedTrack(entity) : null), [entity]);

  const modules = useMemo(() => [...(unified?.modules ?? [])].sort((a, b) => a.order - b.order), [unified?.modules]);

  if (!entity) {
    return <StatePanel title="Preview unavailable" description="Course not found in Academy Studio store." />;
  }

  return (
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Preview as student</p>
          <h1 className="text-2xl font-semibold text-slate-100">{unified?.title ?? entity.course.title}</h1>
          <p className="text-sm text-slate-400">{entity.course.shortDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <StudioStatusBadge status={entity.course.status} />
          <button
            type="button"
            onClick={() => setPreviewMode((prev) => (prev === "student" ? "edit" : "student"))}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode === "student" ? "Edit mode" : "Student mode"}
          </button>
        </div>
      </header>

      <div className="surface-subtle p-4">
        <p className="data-label">Course card preview</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-100">{entity.course.shortTitle}</h2>
        <p className="mt-2 text-sm text-slate-300">{unified?.description ?? entity.course.description}</p>
      </div>

      <div className="space-y-3">
        {modules.map((moduleItem, index) => {
          const locked = previewMode === "student" && index > 0 && modules[index - 1]?.status !== "PUBLISHED";
          const lessons = moduleItem.lessons;
          const quizzes = entity.quizzes.filter((quiz) => quiz.moduleId === moduleItem.id);
          const assignments = entity.assignments.filter((assignment) => assignment.moduleId === moduleItem.id);
          return (
            <article key={moduleItem.id} className="surface-subtle p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{moduleItem.order}. {moduleItem.title}</p>
                  <p className="text-xs text-slate-500">{moduleItem.description || "No module description yet."}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] ${locked ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>
                  {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {locked ? "Locked" : "Open"}
                </span>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Lessons</p>
                  <p className="text-lg font-semibold text-slate-100">{lessons.length}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Quizzes</p>
                  <p className="text-lg font-semibold text-slate-100">{quizzes.length}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Assignments</p>
                  <p className="text-lg font-semibold text-slate-100">{assignments.length}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
