import { cache } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionReveal } from "@/components/landing/section-reveal";
import { resolveRuntimeCatalog } from "@/lib/learning/runtime-content";
import { mapRuntimeCatalogToMissions } from "@/lib/missions/runtime-missions";

// ─── Request-level deduplication ────────────────────────────────────────────
// Both TracksSection and MissionsSection call this; React cache() ensures
// only one DB round-trip per request regardless of how many times it's called.
const getCatalog = cache(() =>
  resolveRuntimeCatalog({ includeCourseEntities: true }),
);

// ─── Fallback data ───────────────────────────────────────────────────────────
const fallbackTracks = [
  {
    href: "/tracks/business-analyst",
    slug: "business-analyst",
    category: "BA",
    title: "Business Analyst",
    accent: "border-orange-400/30 bg-orange-500/10",
    iconColor: "text-orange-300",
    dot: "bg-orange-400",
    duration: "10 weeks",
    modules: 18,
    missions: 14,
    skills: ["User Stories", "Stakeholders", "Requirements"],
    description: "Build strong discovery and requirement skills for product teams.",
  },
  {
    href: "/tracks/data-analyst",
    slug: "data-analyst",
    category: "DA",
    title: "Data Analyst",
    accent: "border-violet-400/30 bg-violet-500/10",
    iconColor: "text-violet-300",
    dot: "bg-violet-400",
    duration: "12 weeks",
    modules: 20,
    missions: 16,
    skills: ["SQL", "Dashboards", "Metrics"],
    description: "Learn analytics fundamentals, BI thinking, and data storytelling.",
  },
  {
    href: "/tracks/qa-engineer",
    slug: "qa-engineer",
    category: "QA",
    title: "QA Engineer",
    accent: "border-emerald-400/30 bg-emerald-500/10",
    iconColor: "text-emerald-300",
    dot: "bg-emerald-400",
    duration: "10 weeks",
    modules: 17,
    missions: 15,
    skills: ["Testing", "API", "Bug Reports"],
    description: "Master functional testing, API validation, and quality workflows.",
  },
  {
    href: "/tracks",
    slug: "product-manager",
    category: "PRODUCT",
    title: "Product Manager",
    accent: "border-sky-400/30 bg-sky-500/10",
    iconColor: "text-sky-300",
    dot: "bg-sky-400",
    duration: "8 weeks",
    modules: 14,
    missions: 12,
    skills: ["Prioritization", "Discovery", "Execution"],
    description: "Understand product strategy and execution with practical exercises.",
  },
];

const fallbackMissions = [
  {
    title: "API Bug Investigation",
    scenario: "Release candidate returns inconsistent status codes under edge conditions.",
    xp: 140,
    status: "In progress",
    category: "QA",
    accent: "border-emerald-400/25 bg-emerald-500/8",
    dot: "bg-emerald-400",
  },
  {
    title: "Stakeholder Request to User Story",
    scenario: "Convert a vague request into clear acceptance criteria and testable scope.",
    xp: 120,
    status: "Available",
    category: "BA",
    accent: "border-orange-400/25 bg-orange-500/8",
    dot: "bg-orange-400",
  },
  {
    title: "Retention Dataset Deep Dive",
    scenario: "Analyze churn signals and propose 3 high-impact product actions.",
    xp: 180,
    status: "Locked",
    category: "DA",
    accent: "border-violet-400/25 bg-violet-500/8",
    dot: "bg-violet-400",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function accentByCategory(category: string) {
  if (category === "QA") return "border-emerald-400/30 bg-emerald-500/10";
  if (category === "BA") return "border-orange-400/30 bg-orange-500/10";
  if (category === "DA") return "border-violet-400/30 bg-violet-500/10";
  return "border-sky-400/30 bg-sky-500/10";
}

function dotByCategory(category: string) {
  if (category === "QA") return "bg-emerald-400";
  if (category === "BA") return "bg-orange-400";
  if (category === "DA") return "bg-violet-400";
  return "bg-sky-400";
}

function iconColorByCategory(category: string) {
  if (category === "QA") return "text-emerald-300";
  if (category === "BA") return "text-orange-300";
  if (category === "DA") return "text-violet-300";
  return "text-sky-300";
}

function skillHintsByCategory(category: string) {
  if (category === "QA") return ["Testing", "API", "Bug Reports"];
  if (category === "BA") return ["User Stories", "Stakeholders", "Requirements"];
  if (category === "DA") return ["SQL", "Dashboards", "Metrics"];
  return ["Product Sense", "Prioritization", "Communication"];
}

function missionAccentByCategory(category: string) {
  if (category === "QA") return "border-emerald-400/25 bg-emerald-500/8";
  if (category === "BA") return "border-orange-400/25 bg-orange-500/8";
  if (category === "DA") return "border-violet-400/25 bg-violet-500/8";
  return "border-sky-400/25 bg-sky-500/8";
}

function normalizeMissionStatus(status: string) {
  if (status === "in_progress") return "In progress";
  if (status === "locked") return "Locked";
  return "Available";
}

function missionStatusColor(status: string) {
  if (status === "In progress" || status === "in_progress")
    return "border-sky-400/30 bg-sky-500/10 text-sky-300";
  if (status === "locked")
    return "border-border/60 bg-card/50 text-muted-foreground";
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
}

// ─── Tracks section ───────────────────────────────────────────────────────────
export async function TracksSection() {
  const catalog = await getCatalog();

  const dynamicTracks = catalog.courses
    .filter(
      (course) =>
        course.category === "QA" ||
        course.category === "BA" ||
        course.category === "DA" ||
        course.category === "PRODUCT",
    )
    .slice(0, 4)
    .map((course) => ({
      href: `/tracks/${course.slug}`,
      slug: course.slug,
      category: course.category,
      title: course.title,
      accent: accentByCategory(course.category),
      iconColor: iconColorByCategory(course.category),
      dot: dotByCategory(course.category),
      duration: `${Math.max(4, Math.round(course.estimatedDuration / 300))} weeks`,
      modules: course.modules.length,
      missions:
        course.modules.reduce(
          (sum, moduleItem) => sum + moduleItem.missions.length,
          0,
        ) || course.modules.length,
      skills:
        course.tags.slice(0, 3).length > 0
          ? course.tags.slice(0, 3)
          : skillHintsByCategory(course.category),
      description: course.shortDescription || course.description,
    }));

  const tracks = dynamicTracks.length > 0 ? dynamicTracks : fallbackTracks;

  return (
    <SectionReveal>
      <section id="tracks" className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div className="section-header">
            <p className="kicker">Career tracks</p>
            <h2 className="section-title">Choose your role-focused path</h2>
          </div>
          <Link
            href="/tracks"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden shrink-0 sm:inline-flex",
            )}
          >
            All tracks
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tracks.map((track) => (
            <article
              key={track.title}
              className={cn(
                "surface-panel-hover flex flex-col gap-4 rounded-2xl border p-5",
                track.accent,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", track.dot)} />
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-[0.14em]",
                        track.iconColor,
                      )}
                    >
                      {track.category}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold text-foreground">
                    {track.title}
                  </h3>
                </div>
              </div>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {track.description}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="stat-card">
                  <p className="stat-card-label">Duration</p>
                  <p className="stat-card-value mt-1 text-sm">{track.duration}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-card-label">Modules</p>
                  <p className="stat-card-value mt-1 text-sm">{track.modules}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-card-label">Missions</p>
                  <p className="stat-card-value mt-1 text-sm">{track.missions}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {track.skills.map((skill) => (
                  <span key={skill} className="skill-tag px-2 py-0.5 text-xs">
                    {skill}
                  </span>
                ))}
              </div>
              <Link
                href={track.href}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-auto w-full")}
              >
                Explore track
              </Link>
            </article>
          ))}
        </div>
      </section>
    </SectionReveal>
  );
}

// ─── Missions section ─────────────────────────────────────────────────────────
export async function MissionsSection() {
  const catalog = await getCatalog();

  const dynamicMissionCards = mapRuntimeCatalogToMissions(catalog)
    .slice(0, 3)
    .map((mission) => ({
      title: mission.title,
      scenario: mission.scenario,
      xp: mission.xpReward,
      status: normalizeMissionStatus(mission.status),
      category: "QA",
      accent: missionAccentByCategory("QA"),
      dot: "bg-sky-400",
    }));

  const missions =
    dynamicMissionCards.length > 0 ? dynamicMissionCards : fallbackMissions;

  return (
    <SectionReveal>
      <section id="missions" className="space-y-8">
        <div className="section-header">
          <p className="kicker">Real-world missions</p>
          <h2 className="section-title">Practice with scenarios that mirror real teams</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {missions.map((mission) => (
            <article
              key={mission.title}
              className={cn(
                "surface-panel-hover flex flex-col gap-4 rounded-2xl border p-5",
                mission.accent,
              )}
            >
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", mission.dot)} />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {mission.category}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{mission.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {mission.scenario}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
                  +{mission.xp} XP
                </span>
                <span
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                    missionStatusColor(mission.status),
                  )}
                >
                  {mission.status}
                </span>
              </div>
              <Link
                href="/missions"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-auto w-full",
                )}
              >
                Open mission
              </Link>
            </article>
          ))}
        </div>
      </section>
    </SectionReveal>
  );
}
