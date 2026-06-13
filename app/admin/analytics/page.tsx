import { ProgressStatus, TrackCategory } from "@prisma/client";
import { AlertTriangle, Award, BarChart3, BookOpen, CheckCircle2, TrendingDown, UserX, Users2 } from "lucide-react";

import { StudioCourseAnalytics } from "@/components/admin/analytics/studio-course-analytics";
import { StudioKpiCard } from "@/components/admin/studio-kpi-card";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type AnalyticsAdminPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function aggregateCount(value: true | { _all?: number } | undefined) {
  return typeof value === "object" && value !== null ? value._all ?? 0 : 0;
}

export default async function AnalyticsAdminPage({ searchParams }: AnalyticsAdminPageProps) {
  await requireAdminPermission("analytics.read");

  const resolvedSearchParams = await searchParams;
  const query = paramValue(resolvedSearchParams?.q);
  const categoryParam = paramValue(resolvedSearchParams?.category);
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
    courseCertificates,
    completedProgress,
    inProgress,
    notStarted,
    trackRows,
    latestCertificates,
    latestCourseCertificates,
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
      prisma.courseCertificate.count(),
      prisma.userProgress.count({ where: { status: ProgressStatus.COMPLETED } }),
      prisma.userProgress.count({ where: { status: ProgressStatus.IN_PROGRESS } }),
      prisma.userProgress.count({ where: { status: ProgressStatus.NOT_STARTED } }),
      prisma.track.findMany({
        where: {
          ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
          ...(categoryFilter !== "ALL" ? { category: categoryFilter } : {}),
        },
        take: 10,
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
        take: 20,
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
      prisma.courseCertificate.findMany({
        take: 20,
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
          course: {
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

  const wrongQuestionGroups = await prisma.quizQuestionResult.groupBy({
    by: ["questionId"],
    where: { isCorrect: false },
    _count: { _all: true },
    orderBy: { _count: { questionId: "desc" } },
    take: 10,
  });
  const wrongQuestionIds = wrongQuestionGroups.map((group) => group.questionId);
  const [questionAttemptGroups, wrongQuestionDetails] = wrongQuestionIds.length > 0
    ? await prisma.$transaction([
        prisma.quizQuestionResult.groupBy({
          by: ["questionId"],
          where: { questionId: { in: wrongQuestionIds } },
          _count: { _all: true },
          orderBy: { questionId: "asc" },
        }),
        prisma.quizQuestionResult.findMany({
          where: { questionId: { in: wrongQuestionIds } },
          distinct: ["questionId"],
          orderBy: { createdAt: "desc" },
          select: {
            questionId: true,
            questionText: true,
            attempt: {
              select: {
                trackTitle: true,
                moduleTitle: true,
                quizTitle: true,
              },
            },
          },
        }),
      ])
    : [[], []] as const;

  const growthByMonth = userGrowthRaw.reduce<Record<string, number>>((acc, item: { createdAt: Date }) => {
    const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const growthRows = Object.entries(growthByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
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
  const popularTracks = [...completionRows].sort((a, b) => b.started - a.started).slice(0, 10);
  const latestCertificateRows = [
    ...latestCertificates.map((certificate) => ({
      id: `track-${certificate.id}`,
      issuedAt: certificate.issuedAt,
      user: certificate.user,
      title: certificate.track.title,
      type: "Track",
    })),
    ...latestCourseCertificates.map((certificate) => ({
      id: `course-${certificate.id}`,
      issuedAt: certificate.issuedAt,
      user: certificate.user,
      title: certificate.course.title,
      type: "Course",
    })),
  ]
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
    .slice(0, 20);
  const totalAttemptsByQuestionId = new Map(
    questionAttemptGroups.map((group) => [group.questionId, aggregateCount(group._count)]),
  );
  const detailsByQuestionId = new Map(
    wrongQuestionDetails.map((item) => [item.questionId, item]),
  );
  const difficultQuestions = wrongQuestionGroups.map((group) => {
    const wrongCount = aggregateCount(group._count);
    const totalAttempts = totalAttemptsByQuestionId.get(group.questionId) ?? wrongCount;
    const details = detailsByQuestionId.get(group.questionId);
    return {
      questionId: group.questionId,
      wrongCount,
      totalAttempts,
      failRate: totalAttempts > 0 ? Math.round((wrongCount / totalAttempts) * 100) : 0,
      questionText: details?.questionText ?? group.questionId,
      trackTitle: details?.attempt.trackTitle ?? "Unknown track",
      moduleTitle: details?.attempt.moduleTitle ?? "Unknown module",
      quizTitle: details?.attempt.quizTitle ?? "Unknown quiz",
    };
  });
  const [
    moduleAttemptGroups,
    moduleFailedGroups,
    moduleAttemptDetails,
    recentQuizAttempts,
  ] = await prisma.$transaction([
    prisma.quizAttempt.groupBy({
      by: ["moduleId"],
      _count: { _all: true },
      _avg: { score: true },
      orderBy: { moduleId: "asc" },
    }),
    prisma.quizAttempt.groupBy({
      by: ["moduleId"],
      where: { passed: false },
      _count: { _all: true },
      orderBy: { moduleId: "asc" },
    }),
    prisma.quizAttempt.findMany({
      distinct: ["moduleId"],
      orderBy: { submittedAt: "desc" },
      select: {
        moduleId: true,
        moduleTitle: true,
        trackSlug: true,
        trackTitle: true,
        quizTitle: true,
      },
    }),
    prisma.quizAttempt.findMany({
      orderBy: { submittedAt: "desc" },
      take: 200,
      select: {
        id: true,
        userId: true,
        score: true,
        passingScore: true,
        passed: true,
        submittedAt: true,
        trackSlug: true,
        trackTitle: true,
        moduleId: true,
        moduleTitle: true,
        quizTitle: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);
  const failedAttemptsByModuleId = new Map(
    moduleFailedGroups.map((group) => [group.moduleId, aggregateCount(group._count)]),
  );
  const moduleDetailsById = new Map(
    moduleAttemptDetails.map((item) => [item.moduleId, item]),
  );
  const weakModules = moduleAttemptGroups
    .map((group) => {
      const totalAttempts = aggregateCount(group._count);
      const failedAttempts = failedAttemptsByModuleId.get(group.moduleId) ?? 0;
      const details = moduleDetailsById.get(group.moduleId);

      return {
        moduleId: group.moduleId,
        moduleTitle: details?.moduleTitle ?? group.moduleId,
        trackTitle: details?.trackTitle ?? "Unknown track",
        trackSlug: details?.trackSlug ?? "",
        quizTitle: details?.quizTitle ?? "Unknown quiz",
        attempts: totalAttempts,
        failedAttempts,
        averageScore: Math.round(group._avg?.score ?? 0),
        failRate: totalAttempts > 0 ? Math.round((failedAttempts / totalAttempts) * 100) : 0,
      };
    })
    .filter((item) => item.attempts > 0)
    .sort((a, b) => a.averageScore - b.averageScore || b.failRate - a.failRate)
    .slice(0, 8);
  const seenLearnerModules = new Set<string>();
  const learnersNeedingHelp = recentQuizAttempts
    .flatMap((attempt) => {
      const key = `${attempt.userId}:${attempt.moduleId}`;
      if (seenLearnerModules.has(key)) {
        return [];
      }
      seenLearnerModules.add(key);
      if (attempt.passed) {
        return [];
      }

      return [{
        id: attempt.id,
        userName: attempt.user.name,
        email: attempt.user.email,
        trackTitle: attempt.trackTitle,
        trackSlug: attempt.trackSlug,
        moduleId: attempt.moduleId,
        moduleTitle: attempt.moduleTitle,
        quizTitle: attempt.quizTitle,
        score: attempt.score,
        passingScore: attempt.passingScore,
        gap: Math.max(attempt.passingScore - attempt.score, 0),
        submittedAt: attempt.submittedAt,
      }];
    })
    .sort((a, b) => b.gap - a.gap || b.submittedAt.getTime() - a.submittedAt.getTime())
    .slice(0, 10);

  return (
    <section className="page-shell">
      <header className="surface-elevated space-y-2 p-5 text-foreground">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="section-title">Analytics</h2>
            <p className="text-sm text-muted-foreground">Local metrics for users, content, progress, and certificates.</p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <a
            href="/api/admin/export/activity"
            className="btn-secondary text-sm shrink-0"
            download
          >
            Export activity CSV
          </a>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StudioKpiCard
          label="Users"
          value={users}
          icon={<Users2 className="h-4 w-4" />}
          accent="sky"
        />
        <StudioKpiCard
          label="Tracks / Modules"
          value={`${tracks} / ${modules}`}
          helper="Content library"
          icon={<BookOpen className="h-4 w-4" />}
          accent="violet"
        />
        <StudioKpiCard
          label="Quizzes / Questions"
          value={`${quizzes} / ${questions}`}
          icon={<BarChart3 className="h-4 w-4" />}
          accent="amber"
        />
        <StudioKpiCard
          label="Progress completed"
          value={completedProgress}
          helper={`${inProgress} in progress · ${notStarted} not started`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="emerald"
        />
        <StudioKpiCard
          label="Certificates"
          value={certificates + courseCertificates}
          icon={<Award className="h-4 w-4" />}
          accent="rose"
        />
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

        <p className="text-xs text-muted-foreground">Showing top 10 tracks for current filters.</p>

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
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Latest 20 certificates</h3>
          <a href="/admin/certificates" className="text-xs text-muted-foreground hover:text-foreground">
            View all →
          </a>
        </div>
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
              {latestCertificateRows.map((certificate) => (
                <tr key={certificate.id} className="table-row">
                  <td className="px-3 py-3 text-muted-foreground">{certificate.issuedAt.toLocaleString()}</td>
                  <td className="px-3 py-3">{certificate.user.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{certificate.user.email}</td>
                  <td className="px-3 py-3">
                    <span className="mr-2 rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {certificate.type}
                    </span>
                    {certificate.title}
                  </td>
                </tr>
              ))}
              {latestCertificateRows.length === 0 && (
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

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="surface-elevated space-y-4 p-5 text-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                <TrendingDown className="h-5 w-5 text-rose-500" />
                Weak modules
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Modules sorted by lowest average quiz score.
              </p>
            </div>
            <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              {weakModules.length} modules
            </span>
          </div>

          {weakModules.length > 0 ? (
            <div className="space-y-3">
              {weakModules.map((item) => (
                <article key={item.moduleId} className="rounded-2xl border border-border bg-card/65 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.trackTitle}</p>
                      <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{item.moduleTitle}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{item.quizTitle}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
                      avg {item.averageScore}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.max(item.failRate, 6)}%` }} />
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                    <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                      Attempts: <span className="font-semibold text-foreground">{item.attempts}</span>
                    </p>
                    <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                      Failed: <span className="font-semibold text-foreground">{item.failedAttempts}</span>
                    </p>
                    <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                      Fail rate: <span className="font-semibold text-foreground">{item.failRate}%</span>
                    </p>
                  </div>
                  {item.trackSlug ? (
                    <a
                      href={`/tracks/${item.trackSlug}/modules/${item.moduleId}`}
                      className="mt-3 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                    >
                      Open module →
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-border bg-card/55 px-4 py-3 text-sm text-muted-foreground">
              No module quiz history yet.
            </p>
          )}
        </div>

        <div className="surface-elevated space-y-4 p-5 text-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                <UserX className="h-5 w-5 text-amber-500" />
                Learners needing help
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest failed quiz per learner and module.
              </p>
            </div>
            <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              {learnersNeedingHelp.length} active
            </span>
          </div>

          {learnersNeedingHelp.length > 0 ? (
            <div className="space-y-3">
              {learnersNeedingHelp.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-card/65 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.userName}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.trackTitle} · {item.moduleTitle}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                      -{item.gap}%
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                    <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                      Score: <span className="font-semibold text-foreground">{item.score}%</span>
                    </p>
                    <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                      Need: <span className="font-semibold text-foreground">{item.passingScore}%</span>
                    </p>
                    <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                      Last: <span className="font-semibold text-foreground">{item.submittedAt.toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`/tracks/${item.trackSlug}/modules/${item.moduleId}`}
                      className="btn-secondary px-3 py-2 text-xs"
                    >
                      Open module
                    </a>
                    <a href="/admin/users" className="btn-secondary px-3 py-2 text-xs">
                      User list
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-border bg-card/55 px-4 py-3 text-sm text-muted-foreground">
              No active failed quiz attempts yet.
            </p>
          )}
        </div>
      </section>

      <section className="surface-elevated space-y-4 p-5 text-foreground">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Most difficult quiz questions
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on saved question-level quiz attempts.
            </p>
          </div>
          <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            {difficultQuestions.length} tracked
          </span>
        </div>

        {difficultQuestions.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {difficultQuestions.map((item) => (
              <article key={item.questionId} className="rounded-2xl border border-border bg-card/65 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {item.trackTitle} · {item.moduleTitle}
                    </p>
                    <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                      {item.questionText}
                    </h4>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                    {item.failRate}% fail
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                    Wrong: <span className="font-semibold text-foreground">{item.wrongCount}</span>
                  </p>
                  <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                    Attempts: <span className="font-semibold text-foreground">{item.totalAttempts}</span>
                  </p>
                  <p className="rounded-xl border border-border bg-background/50 px-3 py-2">
                    Quiz: <span className="font-semibold text-foreground">{item.quizTitle}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border bg-card/55 px-4 py-3 text-sm text-muted-foreground">
            No quiz attempt history yet. This section will populate after students submit quizzes.
          </p>
        )}
      </section>

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
        <h3 className="text-lg font-semibold">User growth by month <span className="text-sm font-normal text-muted-foreground">(last 12 months)</span></h3>
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
        <h3 className="text-lg font-semibold">Top 10 popular tracks</h3>
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
