import { TrackCategory } from "@prisma/client";

import { updateTrackAction } from "@/app/admin/actions";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type TracksAdminPageProps = {
  searchParams?: {
    q?: string | string[];
    category?: string | string[];
  };
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function TracksAdminPage({ searchParams }: TracksAdminPageProps) {
  await requireAdminPermission("courses.read");

  const query = paramValue(searchParams?.q);
  const categoryParam = paramValue(searchParams?.category);
  const categoryFilter = Object.values(TrackCategory).includes(categoryParam as TrackCategory)
    ? (categoryParam as TrackCategory)
    : "ALL";

  const tracks = await prisma.track.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoryFilter !== "ALL" ? { category: categoryFilter } : {}),
    },
    orderBy: {
      title: "asc",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      color: true,
      category: true,
      _count: {
        select: {
          modules: true,
          certificates: true,
        },
      },
    },
  });

  return (
    <section className="surface-elevated space-y-4 p-5 text-foreground">
      <header className="space-y-2">
        <h2 className="section-title">Tracks</h2>
        <p className="text-sm text-muted-foreground">Search tracks, filter by category, and edit metadata.</p>
      </header>

      <form className="surface-subtle grid gap-3 p-4 md:grid-cols-[1fr_180px_auto]">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by title or slug"
          className="input-base"
        />
        <select
          name="category"
          defaultValue={categoryFilter}
          className="select-base"
        >
          <option value="ALL">All categories</option>
          <option value={TrackCategory.QA}>QA</option>
          <option value={TrackCategory.BA}>BA</option>
          <option value={TrackCategory.DA}>DA</option>
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
              <th className="px-3 py-3">Slug</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Color</th>
              <th className="px-3 py-3">Modules</th>
              <th className="px-3 py-3">Certificates</th>
              <th className="px-3 py-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id} className="table-row">
                <td className="px-3 py-3 text-muted-foreground">{track.slug}</td>
                <td className="px-3 py-3">
                  <input
                    form={`track-edit-${track.id}`}
                    name="title"
                    defaultValue={track.title}
                    className="input-base h-9 px-2 py-1.5"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    form={`track-edit-${track.id}`}
                    name="description"
                    defaultValue={track.description}
                    className="input-base h-9 px-2 py-1.5"
                  />
                </td>
                <td className="px-3 py-3">
                  <select
                    form={`track-edit-${track.id}`}
                    name="category"
                    defaultValue={track.category}
                    className="select-base h-9 px-2 py-1.5"
                  >
                    <option value={TrackCategory.QA}>QA</option>
                    <option value={TrackCategory.BA}>BA</option>
                    <option value={TrackCategory.DA}>DA</option>
                  </select>
                </td>
                <td className="px-3 py-3">
                  <input
                    form={`track-edit-${track.id}`}
                    name="color"
                    defaultValue={track.color}
                    className="input-base h-9 w-28 px-2 py-1.5"
                  />
                </td>
                <td className="px-3 py-3 text-muted-foreground">{track._count.modules}</td>
                <td className="px-3 py-3 text-muted-foreground">{track._count.certificates}</td>
                <td className="px-3 py-3">
                  <form id={`track-edit-${track.id}`} action={updateTrackAction}>
                    <input type="hidden" name="trackId" value={track.id} />
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
            {tracks.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={8}>
                  No tracks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
