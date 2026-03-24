"use client";

import Link from "next/link";
import { Activity, BarChart3, BookOpen, FileStack, Layers3, Medal, Plus, Sparkles, Users } from "lucide-react";

import { StudioKpiCard } from "@/components/admin/studio-kpi-card";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

type StudioDashboardProps = {
  realStats: {
    users: number;
    tracks: number;
    modules: number;
    lessons: number;
    quizzes: number;
    certificates: number;
  };
};

export function StudioDashboard({ realStats }: StudioDashboardProps) {
  const courses = useCourseBuilderStore((state) => state.courses);
  const templates = useCourseBuilderStore((state) => state.templates);

  const totalLessons = courses.reduce((sum, entity) => sum + entity.lessons.length, 0);
  const totalQuizzes = courses.reduce((sum, entity) => sum + entity.quizzes.length, 0);
  const totalAssignments = courses.reduce((sum, entity) => sum + entity.assignments.length, 0);
  const totalSimulations = courses.reduce((sum, entity) => sum + entity.simulations.length, 0);
  const draftCourses = courses.filter((entity) => entity.course.status === "DRAFT").length;
  const reviewCourses = courses.filter((entity) => entity.course.status === "IN_REVIEW").length;
  const publishedCourses = courses.filter((entity) => entity.course.status === "PUBLISHED").length;

  const recentEdits = courses
    .flatMap((entity) =>
      entity.versions.slice(0, 2).map((version) => ({
        id: version.id,
        courseTitle: entity.course.title,
        note: version.changelogNote,
        date: version.updatedAt,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 text-slate-100">
        <p className="kicker">Academy Studio</p>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-slate-400">
          Build, publish, and analyze course content with a visual LMS constructor.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StudioKpiCard label="Total courses" value={courses.length} helper={`${draftCourses} draft / ${publishedCourses} published`} icon={<BookOpen className="h-4 w-4" />} />
        <StudioKpiCard label="Lessons / Quizzes" value={`${totalLessons} / ${totalQuizzes}`} helper="Builder entities" icon={<Layers3 className="h-4 w-4" />} />
        <StudioKpiCard label="Assignments / Simulations" value={`${totalAssignments} / ${totalSimulations}`} helper="Practice content" icon={<Sparkles className="h-4 w-4" />} />
        <StudioKpiCard label="Templates" value={templates.length} helper={`${reviewCourses} awaiting review`} icon={<FileStack className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Quick actions</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/courses/new" className="btn-primary gap-2">
              <Plus className="h-4 w-4" />
              Create new course
            </Link>
            <Link href="/admin/templates" className="btn-secondary gap-2">
              <FileStack className="h-4 w-4" />
              Open templates
            </Link>
            <Link href="/admin/media" className="btn-secondary gap-2">
              <Activity className="h-4 w-4" />
              Open media manager
            </Link>
            <Link href="/admin/analytics" className="btn-secondary gap-2">
              <BarChart3 className="h-4 w-4" />
              Open analytics
            </Link>
          </div>
        </section>

        <section className="surface-elevated space-y-3 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Legacy platform stats</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-slate-500" />Users</span><span>{realStats.users}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-500" />Tracks</span><span>{realStats.tracks}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4 text-slate-500" />Modules</span><span>{realStats.modules}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><FileStack className="h-4 w-4 text-slate-500" />Lessons</span><span>{realStats.lessons}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-slate-500" />Quizzes</span><span>{realStats.quizzes}</span></p>
            <p className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Medal className="h-4 w-4 text-slate-500" />Certificates</span><span>{realStats.certificates}</span></p>
          </div>
        </section>
      </div>

      <section className="surface-elevated space-y-3 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Recent edits</h2>
        {recentEdits.length === 0 ? (
          <p className="text-sm text-slate-400">No builder activity yet.</p>
        ) : (
          <div className="space-y-2">
            {recentEdits.map((item) => (
              <article key={item.id} className="surface-subtle p-3">
                <p className="text-sm font-semibold text-slate-100">{item.courseTitle}</p>
                <p className="text-xs text-slate-400">{item.note}</p>
                <p className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
