import type { Metadata } from "next";

import { updateCertificateAction } from "@/app/admin/actions";
import { SaveRowButton } from "@/components/admin/save-row-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Certificates — Admin",
  robots: { index: false },
};

const PAGE_SIZE = 25;

type CertificatesAdminPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    contentId?: string | string[];
    trackId?: string | string[];
    page?: string | string[];
  }>;
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CertificatesAdminPage({ searchParams }: CertificatesAdminPageProps) {
  await requireAdminPermission("certificates.manage");

  const resolvedSearchParams = await searchParams;
  const query = paramValue(resolvedSearchParams?.q);
  const legacyTrackIdFilter = paramValue(resolvedSearchParams?.trackId);
  const contentIdFilter = paramValue(resolvedSearchParams?.contentId) || (legacyTrackIdFilter ? `track:${legacyTrackIdFilter}` : "");
  const [contentKind, rawContentId] = contentIdFilter.includes(":")
    ? contentIdFilter.split(":", 2)
    : ["track", contentIdFilter];
  const trackIdFilter = contentKind === "track" ? rawContentId : "";
  const courseIdFilter = contentKind === "course" ? rawContentId : "";

  const page = Math.max(1, parseInt(paramValue(resolvedSearchParams?.page) || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const certWhere = {
    ...(query
      ? {
          OR: [
            { certificateUrl: { contains: query, mode: "insensitive" as const } },
            { user: { email: { contains: query, mode: "insensitive" as const } } },
            { user: { name: { contains: query, mode: "insensitive" as const } } },
            { track: { title: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(trackIdFilter ? { trackId: trackIdFilter } : {}),
    ...(courseIdFilter ? { id: "__never__" } : {}),
  };

  const [tracks, courses, trackCertificates, courseCertificates, trackTotal, courseTotal] = await prisma.$transaction([
    prisma.track.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.certificate.findMany({
      where: certWhere,
      orderBy: { issuedAt: "desc" },
      take: PAGE_SIZE + skip,
      select: {
        id: true,
        issuedAt: true,
        certificateUrl: true,
        user: { select: { name: true, email: true } },
        track: { select: { title: true, category: true } },
      },
    }),
    prisma.courseCertificate.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { certificateUrl: { contains: query, mode: "insensitive" as const } },
                { user: { email: { contains: query, mode: "insensitive" as const } } },
                { user: { name: { contains: query, mode: "insensitive" as const } } },
                { course: { title: { contains: query, mode: "insensitive" as const } } },
              ],
            }
          : {}),
        ...(courseIdFilter ? { courseId: courseIdFilter } : {}),
        ...(trackIdFilter ? { id: "__never__" } : {}),
      },
      orderBy: { issuedAt: "desc" },
      take: PAGE_SIZE + skip,
      select: {
        id: true,
        issuedAt: true,
        certificateUrl: true,
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.certificate.count({ where: certWhere }),
    prisma.courseCertificate.count({
      where: {
        ...(query
          ? {
              OR: [
                { certificateUrl: { contains: query, mode: "insensitive" as const } },
                { user: { email: { contains: query, mode: "insensitive" as const } } },
                { user: { name: { contains: query, mode: "insensitive" as const } } },
                { course: { title: { contains: query, mode: "insensitive" as const } } },
              ],
            }
          : {}),
        ...(courseIdFilter ? { courseId: courseIdFilter } : {}),
        ...(trackIdFilter ? { id: "__never__" } : {}),
      },
    }),
  ]);

  const certificates = [
    ...trackCertificates.map((cert) => ({
      id: cert.id,
      kind: "track" as const,
      issuedAt: cert.issuedAt,
      certificateUrl: cert.certificateUrl,
      user: cert.user,
      contentTitle: cert.track.title,
      contentType: "Track",
    })),
    ...courseCertificates.map((cert) => ({
      id: cert.id,
      kind: "course" as const,
      issuedAt: cert.issuedAt,
      certificateUrl: cert.certificateUrl,
      user: cert.user,
      contentTitle: cert.course.title,
      contentType: "Course",
    })),
  ]
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
    .slice(skip, skip + PAGE_SIZE);

  const total = trackTotal + courseTotal;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + PAGE_SIZE, total);

  const activeTrackLabel = contentIdFilter
    ? (
        contentKind === "course"
          ? courses.find((course) => course.id === courseIdFilter)?.title
          : tracks.find((track) => track.id === trackIdFilter)?.title
      ) ?? "selected content"
    : null;

  return (
    <section className="page-shell">
      <PageHeader
        kicker="People"
        title="Certificates"
        description="Search, filter, and update certificate PDF URLs."
      />

      {/* ── Filter ────────────────────────────────────────────────── */}
      <section className="surface-elevated p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by user, track, or URL…"
            className="input-base"
          />
          <select name="contentId" defaultValue={contentIdFilter} className="select-base">
            <option value="">All tracks and courses</option>
            {tracks.map((track) => (
              <option key={track.id} value={`track:${track.id}`}>
                Track: {track.title}
              </option>
            ))}
            {courses.map((course) => (
              <option key={course.id} value={`course:${course.id}`}>
                Course: {course.title}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            Apply
          </button>
        </form>
      </section>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {total} certificate{total !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : ""}
          {activeTrackLabel ? ` in ${activeTrackLabel}` : ""}
        </p>

        {certificates.length === 0 ? (
          <EmptyState
            title="No certificates found"
            description={
              query || trackIdFilter
                ? "Try changing the search query or track filter."
                : "No certificates have been issued yet."
            }
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[1100px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Issued</th>
                  <th className="px-3 py-3 text-left">User</th>
                  <th className="px-3 py-3 text-left">Email</th>
                  <th className="px-3 py-3 text-left">Content</th>
                  <th className="px-3 py-3 text-left">Certificate URL</th>
                  <th className="px-3 py-3 text-left">Save</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id} className="table-row align-top">
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {cert.issuedAt.toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-sm">{cert.user.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {cert.user.email}
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      <span className="mr-2 rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                        {cert.contentType}
                      </span>
                      {cert.contentTitle}
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1.5">
                        <input
                          form={`cert-edit-${cert.id}`}
                          name="certificateUrl"
                          defaultValue={cert.certificateUrl}
                          placeholder="https://…"
                          className="input-base h-9 min-w-[240px] px-2 py-1.5 text-xs"
                        />
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-xs text-sky-300 hover:underline"
                        >
                          Open PDF ↗
                        </a>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <form id={`cert-edit-${cert.id}`} action={updateCertificateAction}>
                        <input type="hidden" name="certificateId" value={cert.id} />
                        <input type="hidden" name="certificateKind" value={cert.kind} />
                        <SaveRowButton />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pagination ────────────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/certificates"
        params={{ q: query || undefined, contentId: contentIdFilter || undefined }}
        itemLabel="certificates"
        from={from}
        to={to}
        total={total}
      />
    </section>
  );
}
