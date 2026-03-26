"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { StudioStatusBadge } from "@/components/admin/studio-status-badge";
import { StatePanel } from "@/components/ui/state-panel";
import { CourseStatus, CourseStudioEntity } from "@/types/builder/course-builder";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

type EntityType = "modules" | "lessons" | "quizzes" | "assignments" | "simulations" | "cases";

type StudioEntitiesPageProps = {
  type: EntityType;
  title: string;
  description: string;
};

type Row = {
  id: string;
  name: string;
  status: CourseStatus;
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  helper: string;
};

const statusOptions: Array<CourseStatus | "ALL"> = ["ALL", "DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];

function buildRows(type: EntityType, courses: CourseStudioEntity[]): Row[] {
  return courses.flatMap((entity) => {
    const moduleById = new Map(entity.modules.map((moduleItem) => [moduleItem.id, moduleItem]));
    if (type === "modules") {
      return entity.modules.map((moduleItem) => ({
        id: moduleItem.id,
        name: moduleItem.title,
        status: moduleItem.status,
        courseId: entity.course.id,
        courseTitle: entity.course.title,
        moduleTitle: moduleItem.title,
        helper: `${moduleItem.estimatedDuration} min | XP ${moduleItem.xpReward}`,
      }));
    }
    if (type === "lessons") {
      return entity.lessons.map((lesson) => ({
        id: lesson.id,
        name: lesson.title,
        status: lesson.status,
        courseId: entity.course.id,
        courseTitle: entity.course.title,
        moduleTitle: moduleById.get(lesson.moduleId)?.title ?? "Unknown module",
        helper: `${lesson.blocks.length} blocks | ${lesson.estimatedDuration} min`,
      }));
    }
    if (type === "quizzes") {
      return entity.quizzes.map((quiz) => ({
        id: quiz.id,
        name: quiz.title,
        status: quiz.status,
        courseId: entity.course.id,
        courseTitle: entity.course.title,
        moduleTitle: moduleById.get(quiz.moduleId)?.title ?? "Unknown module",
        helper: `${quiz.questions.length} questions | pass ${quiz.passingScore}%`,
      }));
    }
    if (type === "assignments") {
      return entity.assignments.map((assignment) => ({
        id: assignment.id,
        name: assignment.title,
        status: assignment.status,
        courseId: entity.course.id,
        courseTitle: entity.course.title,
        moduleTitle: moduleById.get(assignment.moduleId)?.title ?? "Unknown module",
        helper: `${assignment.assignmentType} | max ${assignment.maxScore}`,
      }));
    }
    if (type === "simulations") {
      return entity.simulations.map((simulation) => ({
        id: simulation.id,
        name: simulation.title,
        status: simulation.status,
        courseId: entity.course.id,
        courseTitle: entity.course.title,
        moduleTitle: moduleById.get(simulation.moduleId)?.title ?? "Unknown module",
        helper: `${simulation.simulationType} | ${simulation.estimatedTime} min`,
      }));
    }
    return entity.cases.map((caseStudy) => ({
      id: caseStudy.id,
      name: caseStudy.title,
      status: caseStudy.status,
      courseId: entity.course.id,
      courseTitle: entity.course.title,
      moduleTitle: moduleById.get(caseStudy.moduleId)?.title ?? "Unknown module",
      helper: `${caseStudy.difficulty} difficulty`,
    }));
  });
}

export function StudioEntitiesPage({ type, title, description }: StudioEntitiesPageProps) {
  const courses = useCourseBuilderStore((state) => state.courses);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "ALL">("ALL");

  const rows = useMemo(() => buildRows(type, courses), [courses, type]);
  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          row.name.toLowerCase().includes(q) ||
          row.courseTitle.toLowerCase().includes(q) ||
          row.moduleTitle.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "ALL" || row.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [query, rows, statusFilter],
  );

  return (
    <section className="surface-elevated space-y-4 p-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            className="input-base pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, course, module"
          />
        </label>
        <select className="select-base" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CourseStatus | "ALL")}>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <StatePanel title="No items found" description="Try changing filters or create content in course builder." />
      ) : (
        <div className="table-shell">
          <table className="table-base min-w-[980px]">
            <thead className="table-head">
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Module</th>
                <th>Status</th>
                <th>Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="table-row">
                  <td>{row.name}</td>
                  <td>{row.courseTitle}</td>
                  <td>{row.moduleTitle}</td>
                  <td><StudioStatusBadge status={row.status} /></td>
                  <td>{row.helper}</td>
                  <td>
                    <Link href={`/admin/courses/${row.courseId}/builder`} className="btn-secondary px-3 py-1.5 text-xs">
                      Open builder
                    </Link>
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
