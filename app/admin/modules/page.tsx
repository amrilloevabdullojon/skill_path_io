import { updateModuleAction } from "@/app/admin/actions";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type ModulesAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    trackId?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function ModulesAdminPage({ searchParams }: ModulesAdminPageProps) {
  await requireAdminPermission("courses.read");

  const query = paramValue(searchParams?.q);
  const trackIdFilter = paramValue(searchParams?.trackId);

  const [tracks, modules] = await prisma.$transaction([
    prisma.track.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
      },
    }),
    prisma.module.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(trackIdFilter ? { trackId: trackIdFilter } : {}),
      },
      orderBy: [{ track: { title: "asc" } }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        order: true,
        duration: true,
        trackId: true,
        track: {
          select: {
            title: true,
            slug: true,
          },
        },
        quiz: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    }),
  ]);

  return (
    <section className="surface-elevated space-y-4 p-5 text-foreground">
      <header className="space-y-2">
        <h2 className="section-title">Modules</h2>
        <p className="text-sm text-muted-foreground">Filter by track, search modules, and edit module metadata.</p>
      </header>

      <form className="surface-subtle grid gap-3 p-4 md:grid-cols-[1fr_240px_auto]">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search module title or description"
          className="input-base"
        />
        <select
          name="trackId"
          defaultValue={trackIdFilter}
          className="select-base"
        >
          <option value="">All tracks</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="btn-secondary"
        >
          Apply
        </button>
      </form>

      <div className="table-shell">
        <table className="table-base min-w-[1080px]">
          <thead className="table-head">
            <tr>
              <th className="px-3 py-3">Track</th>
              <th className="px-3 py-3">Order</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3">Duration (min)</th>
              <th className="px-3 py-3">Lessons</th>
              <th className="px-3 py-3">Quiz</th>
              <th className="px-3 py-3">Open</th>
              <th className="px-3 py-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((moduleItem) => (
              <tr key={moduleItem.id} className="table-row">
                <td className="px-3 py-3 text-muted-foreground">{moduleItem.track.title}</td>
                <td className="px-3 py-3">
                  <input
                    form={`module-edit-${moduleItem.id}`}
                    name="order"
                    type="number"
                    min={1}
                    defaultValue={moduleItem.order}
                    className="input-base h-9 w-20 px-2 py-1.5"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    form={`module-edit-${moduleItem.id}`}
                    name="title"
                    defaultValue={moduleItem.title}
                    className="input-base h-9 px-2 py-1.5"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    form={`module-edit-${moduleItem.id}`}
                    name="duration"
                    type="number"
                    min={1}
                    defaultValue={moduleItem.duration}
                    className="input-base h-9 w-28 px-2 py-1.5"
                  />
                </td>
                <td className="px-3 py-3 text-muted-foreground">{moduleItem._count.lessons}</td>
                <td className="px-3 py-3 text-muted-foreground">{moduleItem.quiz ? "Yes" : "No"}</td>
                <td className="px-3 py-3">
                  <a
                    href={`/tracks/${moduleItem.track.slug}/modules/${moduleItem.id}`}
                    className="text-sm font-semibold text-sky-300 hover:underline"
                  >
                    Lesson
                  </a>
                </td>
                <td className="px-3 py-3">
                  <form id={`module-edit-${moduleItem.id}`} action={updateModuleAction}>
                    <input type="hidden" name="moduleId" value={moduleItem.id} />
                    <button
                      type="submit"
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={8}>
                  No modules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
