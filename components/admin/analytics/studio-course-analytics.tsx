"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { StatePanel } from "@/components/ui/state-panel";
import { useCourseBuilderStore } from "@/store/admin/use-course-builder-store";

export function StudioCourseAnalytics() {
  const courses = useCourseBuilderStore((state) => state.courses);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((entity) => {
      if (!q) return true;
      return (
        entity.course.title.toLowerCase().includes(q) ||
        entity.course.category.toLowerCase().includes(q)
      );
    });
  }, [courses, query]);

  return (
    <section className="surface-elevated space-y-4 p-5 text-slate-100">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold">Studio course analytics (mock-ready)</h2>
        <p className="text-sm text-slate-400">
          Analytics widgets for Academy Studio courses, ready to replace with Prisma snapshots.
        </p>
      </header>

      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
        <input
          className="input-base pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search course analytics"
        />
      </label>

      {filtered.length === 0 ? (
        <StatePanel title="No course analytics" description="Create courses in builder to see analytics cards." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((entity) => (
            <article key={entity.course.id} className="surface-subtle space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-100">{entity.course.title}</p>
                <p className="text-xs text-slate-500">{entity.course.category}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Enrolled</p>
                  <p className="text-lg font-semibold">{entity.analytics.enrolledUsers}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Completion rate</p>
                  <p className="text-lg font-semibold">{entity.analytics.completionRate}%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Avg quiz score</p>
                  <p className="text-lg font-semibold">{entity.analytics.averageQuizScore}%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Avg assignment</p>
                  <p className="text-lg font-semibold">{entity.analytics.averageAssignmentScore}%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs text-slate-500">Most difficult module</p>
                  <p className="text-sm font-semibold">{entity.analytics.mostDifficultModule}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Drop-off points: {entity.analytics.dropOffPoints.join(" | ") || "N/A"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
