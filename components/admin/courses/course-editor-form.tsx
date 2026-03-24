"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive, Eye, Save, Sparkles } from "lucide-react";

import { StudioStatusBadge } from "@/components/admin/studio-status-badge";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import { CourseCategory, CourseLevel, CourseStatus } from "@/types/builder/course-builder";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

type CourseEditorFormProps = {
  courseId: string;
};

const categoryOptions: CourseCategory[] = ["QA", "BA", "DA", "PRODUCT", "MANAGEMENT"];
const levelOptions: CourseLevel[] = ["BEGINNER", "JUNIOR", "INTERMEDIATE", "ADVANCED"];
const statusOptions: CourseStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];

export function CourseEditorForm({ courseId }: CourseEditorFormProps) {
  const courseEntity = useCourseBuilderStore((state) =>
    state.courses.find((entity) => entity.course.id === courseId),
  );
  const updateCourse = useCourseBuilderStore((state) => state.updateCourse);
  const setCourseStatus = useCourseBuilderStore((state) => state.setCourseStatus);
  const addVersion = useCourseBuilderStore((state) => state.addVersion);
  const saveAsTemplate = useCourseBuilderStore((state) => state.saveAsTemplate);

  const [versionNote, setVersionNote] = useState("Updated metadata and structure.");

  const course = useMemo(() => courseEntity?.course, [courseEntity]);

  if (!course || !courseEntity) {
    return <StatePanel title="Course not found" description="Open /admin/courses and create a new course first." />;
  }

  return (
    <section className="surface-elevated space-y-5 p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Course metadata</p>
          <h1 className="text-2xl font-semibold text-slate-100">{course.title}</h1>
          <p className="text-sm text-slate-400">Version {course.version} | Last update {new Date(course.updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <StudioStatusBadge status={course.status} />
          <Link href={`/admin/courses/${courseId}/preview`} className="btn-secondary inline-flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </Link>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <input className="input-base" value={course.title} onChange={(event) => updateCourse(courseId, { title: event.target.value })} placeholder="Title" />
        <input className="input-base" value={course.shortTitle} onChange={(event) => updateCourse(courseId, { shortTitle: event.target.value })} placeholder="Short title" />
        <input className="input-base" value={course.slug} onChange={(event) => updateCourse(courseId, { slug: event.target.value })} placeholder="Slug" />
        <input className="input-base" value={course.icon} onChange={(event) => updateCourse(courseId, { icon: event.target.value })} placeholder="Icon" />
        <select className="select-base" value={course.category} onChange={(event) => updateCourse(courseId, { category: event.target.value as CourseCategory })}>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="select-base" value={course.level} onChange={(event) => updateCourse(courseId, { level: event.target.value as CourseLevel })}>
          {levelOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          className="input-base"
          value={course.themeColor}
          onChange={(event) => updateCourse(courseId, { themeColor: event.target.value })}
          placeholder="Theme color"
        />
        <input
          className="input-base"
          type="number"
          value={course.estimatedDuration}
          onChange={(event) => updateCourse(courseId, { estimatedDuration: Number(event.target.value) || 0 })}
          placeholder="Estimated duration"
        />
      </div>

      <textarea className="textarea-base min-h-[110px]" value={course.shortDescription} onChange={(event) => updateCourse(courseId, { shortDescription: event.target.value })} placeholder="Short description" />
      <textarea className="textarea-base min-h-[140px]" value={course.description} onChange={(event) => updateCourse(courseId, { description: event.target.value })} placeholder="Description" />
      <textarea className="textarea-base min-h-[96px]" value={course.targetAudience} onChange={(event) => updateCourse(courseId, { targetAudience: event.target.value })} placeholder="Target audience" />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="surface-subtle p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Publishing workflow</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCourseStatus(courseId, item)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                  item === course.status ? "border-sky-400/45 bg-sky-500/15 text-sky-200" : "border-slate-700 bg-slate-900/85 text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="surface-subtle p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Version history</p>
          <input className="input-base mt-3" value={versionNote} onChange={(event) => setVersionNote(event.target.value)} placeholder="Changelog note" />
          <Button className="mt-2 w-full gap-2" onClick={() => addVersion(courseId, versionNote)}>
            <Save className="h-4 w-4" />
            Save version
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/courses/${courseId}/builder`} className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Open course builder
        </Link>
        <Button variant="secondary" onClick={() => saveAsTemplate(courseId)}>
          Save as template
        </Button>
        <Button variant="destructive" onClick={() => setCourseStatus(courseId, "ARCHIVED")} className="gap-2">
          <Archive className="h-4 w-4" />
          Archive
        </Button>
      </div>
    </section>
  );
}
