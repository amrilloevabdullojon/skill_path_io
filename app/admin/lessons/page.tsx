import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { LessonType } from "@prisma/client"; // still needed for the type filter <select> options

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import type { LessonGroup } from "@/components/admin/lessons/lessons-table";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getLessonListData } from "@/lib/admin/lessons/queries";

export const metadata: Metadata = {
  title: "Lessons — Admin",
  robots: { index: false },
};

const LessonsTable = dynamic(
  () =>
    import("@/components/admin/lessons/lessons-table").then((m) => ({
      default: m.LessonsTable,
    })),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-xl bg-card" /> },
);

type LessonsAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    moduleId?: string | string[];
    type?: string | string[];
    page?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function LessonsAdminPage({ searchParams }: LessonsAdminPageProps) {
  await requireAdminPermission("courses.read");

  const query = paramValue(searchParams?.q);
  const moduleIdFilter = paramValue(searchParams?.moduleId);
  const typeFilter = paramValue(searchParams?.type);
  const hasFilter = !!(query || moduleIdFilter || typeFilter);

  const page = Math.max(1, parseInt(paramValue(searchParams?.page) || "1", 10));

  const { modules, lessons, total, pageSize } = await getLessonListData({
    query,
    moduleId: moduleIdFilter,
    type: typeFilter,
    page,
  });

  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + pageSize, total);

  // Group by module
  const groupMap = new Map<string, LessonGroup>();
  for (const lesson of lessons) {
    if (!groupMap.has(lesson.moduleId)) {
      groupMap.set(lesson.moduleId, {
        moduleId: lesson.moduleId,
        moduleTitle: lesson.module.title,
        trackTitle: lesson.module.track.title,
        trackCategory: lesson.module.track.category,
        lessons: [],
      });
    }
    groupMap.get(lesson.moduleId)!.lessons.push({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      order: lesson.order,
      body: lesson.body,
    });
  }
  const groups = Array.from(groupMap.values());

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Lessons"
        description="Manage lesson content. Edit title, type, and order inline. Use the detail page to edit body content."
        actionLabel="New lesson"
        actionHref="/admin/lessons/new"
      />

      {/* ── Filters ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_220px_160px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by title…"
            className="input-base"
          />
          <select name="moduleId" defaultValue={moduleIdFilter} className="select-base">
            <option value="">All modules</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.title}
              </option>
            ))}
          </select>
          <select name="type" defaultValue={typeFilter} className="select-base">
            <option value="">All types</option>
            <option value={LessonType.TEXT}>TEXT</option>
            <option value={LessonType.VIDEO}>VIDEO</option>
            <option value={LessonType.TASK}>TASK</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary">
              Apply
            </button>
            {hasFilter && (
              <a href="/admin/lessons" className="btn-secondary text-muted-foreground">
                Reset
              </a>
            )}
          </div>
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {totalPages > 1
            ? `Showing ${from}–${to} of ${total} lesson${total !== 1 ? "s" : ""} across ${groups.length} module${groups.length !== 1 ? "s" : ""}`
            : `${total} lesson${total !== 1 ? "s" : ""}`}
          {query ? ` matching "${query}"` : ""}
          {typeFilter ? ` · type: ${typeFilter}` : ""}
        </p>

        {lessons.length === 0 ? (
          <EmptyState
            title="No lessons found"
            description={
              hasFilter
                ? "Try changing your filters."
                : "No lessons exist yet. Create the first one."
            }
            actionLabel="New lesson"
            actionHref="/admin/lessons/new"
            size="sm"
          />
        ) : (
          <LessonsTable groups={groups} />
        )}
      </section>

      {/* ── Pagination ────────────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/lessons"
        params={{
          q: query || undefined,
          moduleId: moduleIdFilter || undefined,
          type: typeFilter || undefined,
        }}
        itemLabel="lessons"
        from={from}
        to={to}
        total={total}
      />
    </section>
  );
}
