import { ProgressStatus, TrackCategory } from "@prisma/client";

import { StudioCourseAnalytics } from "@/components/admin/analytics/studio-course-analytics";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type AnalyticsAdminPageProps = {
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

export default async function AnalyticsAdminPage({ searchParams }: AnalyticsAdminPageProps) {
  await requireAdminPermission("analytics.read");

  const query = paramValue(searchParams?.q);
  const categoryParam = paramValue(searchParams?.category);
  const categoryFilter = Object.values(TrackCategory).includes(categoryParam as TrackCategory)
    ? (categoryParam as TrackCategory)
    : "ALL";

  const [
    users,
    tracks,
    modules,
    quizzes,
    questions,
    certificates,
    completedProgress,
    inProgress,
    notStarted,
    trackRows,
    latestCertificates,
    userGrowthRaw,
    completionRateRaw,
    missionSubmissionCount,
    missionSuccessCount,
    missionAverageScore,
  ] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.track.count(),
      prisma.module.count(),
      prisma.quiz.count(),
      prisma.question.count(),
      prisma.certificate.count(),
      prisma.userProgress.count({ where: { status: ProgressStatus.COMPLETED } }),
      prisma.userProgress.count({ where: { status: ProgressStatus.IN_PROGRESS } }),
      prisma.userProgress.count({ where: { status: ProgressStatus.NOT_STARTED } }),
      prisma.track.findMany({
        where: {
          ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
          ...(categoryFilter !== "ALL" ? { category: categoryFilter } : {}),
        },
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
          category: true,
          _count: {
            select: {
              modules: true,
              certificates: true,
            },
          },
          modules: {
            select: {
              id: true,
              userProgresses: {
                where: {
                  status: ProgressStatus.COMPLETED,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
      prisma.certificate.findMany({
        take: 10,
        orderBy: { issuedAt: "desc" },
        select: {
          id: true,
          issuedAt: true,
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
      prisma.user.findMany({
        select: {
          createdAt: true,
        },
      }),
      prisma.track.findMany({
        select: {
          id: true,
          title: true,
          modules: {
            select: {
              userProgresses: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.userProgress.count({
        where: {
          score: {
            not: null,
          },
        },
      }),
      prisma.userProgress.count({
        where: {
          score: {
            gte: 70,
          },
        },
      }),
      prisma.userProgress.aggregate({
        _avg: {
          score: true,
        },
      }),
    ] as const);

  const growthByMonth = userGrowthRaw.reduce<Record<string, number>>((acc, item: { createdAt: Date }) => {
    const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const growthRows = Object.entries(growthByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  const completionRows = completionRateRaw.map((track) => {
    const statuses = track.modules.flatMap((moduleItem) => moduleItem.userProgresses.map((progress) => progress.status));
    const completed = statuses.filter((status: ProgressStatus) => status === ProgressStatus.COMPLETED).length;
    const started = statuses.filter((status: ProgressStatus) => status !== ProgressStatus.NOT_STARTED).length;
    const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0;

    return {
      id: track.id,
      title: track.title,
      completionRate,
      started,
      completed,
    };
  });

  const missionSuccessRate = missionSubmissionCount > 0
    ? Math.round((missionSuccessCount / missionSubmissionCount) * 100)
    : 0;
  const missionAvg = missionAverageScore._avg.score ? Math.round(missionAverageScore._avg.score) : 0;
  const popularTracks = [...completionRows].sort((a, b) => b.started - a.started).slice(0, 5);

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 text-foreground">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">Local metrics for users, content, progress, and certificates.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="surface-panel surface-panel-hover p-4 text-foreground">
          <p className="text-xs text-muted-foreground">Users</p>
          <p className="text-2xl font-semibold">{users}</p>
        </div>
        <div className="surface-panel surface-panel-hover p-4 text-foreground">
          <p className="text-xs text-muted-foreground">Tracks / Modules</p>
          <p className="text-2xl font-semibold">
            {tracks} / {modules}
          </p>
        </div>
        <div className="surface-panel surface-panel-hover p-4 text-foreground">
          <p className="text-xs text-muted-foreground">Quizzes / Questions</p>
          <p className="text-2xl font-semibold">
            {quizzes} / {questions}
          </p>
        </div>
        <div className="surface-panel surface-panel-hover p-4 text-foreground">
          <p className="text-xs text-muted-foreground">Progress statuses</p>
          <p className="text-sm text-muted-foreground">Completed: {completedProgress}</p>
          <p className="text-sm text-muted-foreground">In progress: {inProgress}</p>
          <p className="text-sm text-muted-foreground">Not started: {notStarted}</p>
        </div>
        <div className="surface-panel surface-panel-hover p-4 text-foreground">
          <p className="text-xs text-muted-foreground">Certificates</p>
          <p className="text-2xl font-semibold">{certificates}</p>
        </div>
      </div>

      <section className="surface-elevated space-y-4 p-5 text-foreground">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search track title"
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
          <table className="table-base min-w-[760px]">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-3">Track</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Modules</th>
                <th className="px-3 py-3">Completed module attempts</th>
                <th className="px-3 py-3">Certificates</th>
              </tr>
            </thead>
            <tbody>
              {trackRows.map((track) => {
                const completedAttempts = track.modules.reduce(
                  (sum, moduleItem) => sum + moduleItem.userProgresses.length,
                  0,
                );

                return (
                  <tr key={track.id} className="table-row">
                    <td className="px-3 py-3">{track.title}</td>
                    <td className="px-3 py-3">{track.category}</td>
                    <td className="px-3 py-3">{track._count.modules}</td>
                    <td className="px-3 py-3">{completedAttempts}</td>
                    <td className="px-3 py-3">{track._count.certificates}</td>
                  </tr>
                );
              })}
              {trackRows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                    No tracks for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-elevated space-y-3 p-5 text-foreground">
        <h3 className="text-lg font-semibold">Latest certificates</h3>
        <div className="table-shell">
          <table className="table-base min-w-[700px]">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-3">Issued at</th>
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Track</th>
              </tr>
            </thead>
            <tbody>
              {latestCertificates.map((certificate) => (
                <tr key={certificate.id} className="table-row">
                  <td className="px-3 py-3 text-muted-foreground">{certificate.issuedAt.toLocaleString()}</td>
                  <td className="px-3 py-3">{certificate.user.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{certificate.user.email}</td>
                  <td className="px-3 py-3">{certificate.track.title}</td>
                </tr>
              ))}
              {latestCertificates.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>
                    No certificates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <StudioCourseAnalytics />

      <section className="surface-elevated space-y-4 p-5 text-foreground">
        <h3 className="text-lg font-semibold">SaaS admin analytics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="surface-subtle p-4">
            <p className="text-xs text-muted-foreground">Mission success rate</p>
            <p className="mt-1 text-xl font-semibold">{missionSuccessRate}%</p>
            <p className="text-xs text-muted-foreground">Average score: {missionAvg}%</p>
          </article>
          <article className="surface-subtle p-4">
            <p className="text-xs text-muted-foreground">Mission submissions</p>
            <p className="mt-1 text-xl font-semibold">{missionSubmissionCount}</p>
            <p className="text-xs text-muted-foreground">Successful: {missionSuccessCount}</p>
          </article>
          <article className="surface-subtle p-4">
            <p className="text-xs text-muted-foreground">User growth periods</p>
            <p className="mt-1 text-xl font-semibold">{growthRows.length}</p>
            <p className="text-xs text-muted-foreground">Monthly aggregation</p>
          </article>
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5 text-foreground">
        <h3 className="text-lg font-semibold">User growth by month</h3>
        <div className="table-shell">
          <table className="table-base min-w-[520px]">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-3">Month</th>
                <th className="px-3 py-3">New users</th>
              </tr>
            </thead>
            <tbody>
              {growthRows.map((row) => (
                <tr key={row.month} className="table-row">
                  <td className="px-3 py-3">{row.month}</td>
                  <td className="px-3 py-3">{row.count}</td>
                </tr>
              ))}
              {growthRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={2}>
                    No user growth data.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5 text-foreground">
        <h3 className="text-lg font-semibold">Track completion rates</h3>
        <div className="table-shell">
          <table className="table-base min-w-[720px]">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-3">Track</th>
                <th className="px-3 py-3">Started attempts</th>
                <th className="px-3 py-3">Completed attempts</th>
                <th className="px-3 py-3">Completion rate</th>
              </tr>
            </thead>
            <tbody>
              {completionRows.map((row) => (
                <tr key={row.id} className="table-row">
                  <td className="px-3 py-3">{row.title}</td>
                  <td className="px-3 py-3">{row.started}</td>
                  <td className="px-3 py-3">{row.completed}</td>
                  <td className="px-3 py-3">{row.completionRate}%</td>
                </tr>
              ))}
              {completionRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>
                    No completion data.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5 text-foreground">
        <h3 className="text-lg font-semibold">Popular tracks</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {popularTracks.map((track) => (
            <article key={track.id} className="surface-subtle p-4">
              <p className="text-sm font-semibold text-foreground">{track.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">Started attempts: {track.started}</p>
              <p className="text-xs text-muted-foreground">Completion rate: {track.completionRate}%</p>
            </article>
          ))}
          {popularTracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No popular track data yet.</p>
          ) : null}
        </div>
      </section>
    </section>
  );
}
