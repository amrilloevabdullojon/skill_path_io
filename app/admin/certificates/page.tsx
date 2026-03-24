import { updateCertificateAction } from "@/app/admin/actions";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type CertificatesAdminPageProps = {
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

export default async function CertificatesAdminPage({ searchParams }: CertificatesAdminPageProps) {
  await requireAdminPermission("certificates.manage");

  const query = paramValue(searchParams?.q);
  const trackIdFilter = paramValue(searchParams?.trackId);

  const [tracks, certificates] = await prisma.$transaction([
    prisma.track.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
      },
    }),
    prisma.certificate.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { certificateUrl: { contains: query, mode: "insensitive" } },
                { user: { email: { contains: query, mode: "insensitive" } } },
                { user: { name: { contains: query, mode: "insensitive" } } },
                { track: { title: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(trackIdFilter ? { trackId: trackIdFilter } : {}),
      },
      orderBy: {
        issuedAt: "desc",
      },
      select: {
        id: true,
        issuedAt: true,
        certificateUrl: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        track: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  return (
    <section className="surface-elevated space-y-4 p-5 text-slate-100">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold">Certificates</h2>
        <p className="text-sm text-slate-400">Search, filter, and edit certificate URLs.</p>
      </header>

      <form className="surface-subtle grid gap-3 p-4 md:grid-cols-[1fr_240px_auto]">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by user, track, or URL"
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
              <th className="px-3 py-3">Issued at</th>
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Track</th>
              <th className="px-3 py-3">Certificate URL</th>
              <th className="px-3 py-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((certificate) => (
              <tr key={certificate.id} className="table-row">
                <td className="px-3 py-3 text-slate-300">{certificate.issuedAt.toLocaleString()}</td>
                <td className="px-3 py-3">{certificate.user.name}</td>
                <td className="px-3 py-3 text-slate-300">{certificate.user.email}</td>
                <td className="px-3 py-3">{certificate.track.title}</td>
                <td className="px-3 py-3">
                  <div className="space-y-1.5">
                    <input
                      form={`certificate-edit-${certificate.id}`}
                      name="certificateUrl"
                      defaultValue={certificate.certificateUrl}
                      className="input-base h-9 px-2 py-1.5"
                    />
                    <a
                      href={certificate.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs text-sky-300 hover:underline"
                    >
                      Open PDF
                    </a>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <form id={`certificate-edit-${certificate.id}`} action={updateCertificateAction}>
                    <input type="hidden" name="certificateId" value={certificate.id} />
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
            {certificates.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-400" colSpan={6}>
                  No certificates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
