"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Archive, Copy, Download, FileUp, Filter, Plus, Search, Trash2 } from "lucide-react";

import { StudioStatusBadge } from "@/components/admin/studio-status-badge";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import { CourseCategory, CourseStatus, CourseStudioEntity } from "@/types/builder/course-builder";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

const categoryList: Array<CourseCategory | "ALL"> = ["ALL", "QA", "BA", "DA", "PRODUCT", "MANAGEMENT"];
const statusList: Array<CourseStatus | "ALL"> = ["ALL", "DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];

function entityCount(entity: CourseStudioEntity) {
  return entity.modules.length + entity.lessons.length + entity.quizzes.length;
}

export function CoursesManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CourseCategory | "ALL">("ALL");
  const [status, setStatus] = useState<CourseStatus | "ALL">("ALL");
  const [bulkAction, setBulkAction] = useState<"publish" | "archive" | "delete" | "duplicate">("publish");
  const [bulkTags, setBulkTags] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const courses = useCourseBuilderStore((state) => state.courses);
  const bulkCourseAction = useCourseBuilderStore((state) => state.bulkCourseAction);
  const deleteCourse = useCourseBuilderStore((state) => state.deleteCourse);
  const duplicateCourse = useCourseBuilderStore((state) => state.duplicateCourse);
  const setCourseStatus = useCourseBuilderStore((state) => state.setCourseStatus);
  const exportCourse = useCourseBuilderStore((state) => state.exportCourse);
  const importCourses = useCourseBuilderStore((state) => state.importCourses);
  const bulkUpdateCourseTags = useCourseBuilderStore((state) => state.bulkUpdateCourseTags);

  const filtered = useMemo(() => {
    return courses
      .filter((entity) => {
        const matchesQuery =
          entity.course.title.toLowerCase().includes(query.toLowerCase()) ||
          entity.course.slug.toLowerCase().includes(query.toLowerCase()) ||
          entity.course.tags.join(" ").toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "ALL" || entity.course.category === category;
        const matchesStatus = status === "ALL" || entity.course.status === status;
        return matchesQuery && matchesCategory && matchesStatus;
      })
      .sort((a, b) => b.course.updatedAt.localeCompare(a.course.updatedAt));
  }, [category, courses, query, status]);

  function toggleSelection(courseId: string) {
    setSelectedIds((prev) =>
      prev.includes(courseId) ? prev.filter((item) => item !== courseId) : [...prev, courseId],
    );
  }

  function handleExport(courseId: string) {
    const payload = exportCourse(courseId);
    if (!payload) {
      return;
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${payload.course.slug}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed)) {
          importCourses(parsed as CourseStudioEntity[]);
          return;
        }
        importCourses([parsed as CourseStudioEntity]);
      } catch (error) {
        console.error("Import failed", error);
      }
    };
    reader.readAsText(file);
  }

  return (
    <section className="surface-elevated space-y-4 p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Academy Studio</p>
          <h1 className="text-2xl font-semibold text-slate-100">Courses</h1>
          <p className="text-sm text-slate-400">Create, assemble, publish, and analyze courses without code edits.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="gap-2">
            <FileUp className="h-4 w-4" />
            Import JSON
          </Button>
          <Link href="/admin/courses/new" className="btn-primary inline-flex gap-2">
            <Plus className="h-4 w-4" />
            New course
          </Link>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-base pl-9"
            placeholder="Search by title, slug, tags"
          />
        </label>
        <label className="relative">
          <Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <select value={category} onChange={(event) => setCategory(event.target.value as CourseCategory | "ALL")} className="select-base pl-9">
            {categoryList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value as CourseStatus | "ALL")} className="select-base">
          {statusList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="surface-subtle flex flex-wrap items-center gap-2 p-3">
        <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value as typeof bulkAction)} className="select-base h-10 w-[180px]">
          <option value="publish">Bulk publish</option>
          <option value="archive">Bulk archive</option>
          <option value="duplicate">Bulk duplicate</option>
          <option value="delete">Bulk delete</option>
        </select>
        <Button
          variant="secondary"
          disabled={selectedIds.length === 0}
          onClick={() => bulkCourseAction(selectedIds, bulkAction)}
        >
          Apply to {selectedIds.length}
        </Button>
        <input
          value={bulkTags}
          onChange={(event) => setBulkTags(event.target.value)}
          className="input-base h-10 min-w-[220px] flex-1"
          placeholder="Bulk tags, ex: qa, sprint, premium"
        />
        <Button
          variant="secondary"
          disabled={selectedIds.length === 0}
          onClick={() => bulkUpdateCourseTags(selectedIds, bulkTags.split(",").map((item) => item.trim()).filter(Boolean))}
        >
          Update tags
        </Button>
      </div>

      {filtered.length === 0 ? (
        <StatePanel title="No courses found" description="Try changing filters or create a new course." />
      ) : (
        <div className="table-shell">
          <table className="table-base min-w-[1120px]">
            <thead className="table-head">
              <tr>
                <th />
                <th>Course</th>
                <th>Status</th>
                <th>Category</th>
                <th>Entities</th>
                <th>Version</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entity) => (
                <tr key={entity.course.id} className="table-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entity.course.id)}
                      onChange={() => toggleSelection(entity.course.id)}
                      className="h-4 w-4 accent-sky-400"
                    />
                  </td>
                  <td>
                    <div>
                      <p className="font-semibold text-slate-100">{entity.course.title}</p>
                      <p className="text-xs text-slate-500">{entity.course.slug}</p>
                    </div>
                  </td>
                  <td><StudioStatusBadge status={entity.course.status} /></td>
                  <td>{entity.course.category}</td>
                  <td>{entityCount(entity)}</td>
                  <td>v{entity.course.version}</td>
                  <td>{new Date(entity.course.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      <Link href={`/admin/courses/${entity.course.id}`} className="btn-secondary px-2.5 py-1.5 text-xs">
                        Edit
                      </Link>
                      <Link href={`/admin/courses/${entity.course.id}/builder`} className="btn-secondary px-2.5 py-1.5 text-xs">
                        Builder
                      </Link>
                      <Link href={`/admin/courses/${entity.course.id}/preview`} className="btn-secondary px-2.5 py-1.5 text-xs">
                        Preview
                      </Link>
                      <button type="button" onClick={() => handleExport(entity.course.id)} className="btn-secondary px-2.5 py-1.5 text-xs">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => duplicateCourse(entity.course.id)} className="btn-secondary px-2.5 py-1.5 text-xs">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setCourseStatus(entity.course.id, "ARCHIVED")} className="btn-secondary px-2.5 py-1.5 text-xs">
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => deleteCourse(entity.course.id)} className="btn-destructive px-2.5 py-1.5 text-xs">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
