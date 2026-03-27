import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  GraduationCap,
  LineChart,
  Rocket,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LandingAmbientBackground } from "@/components/landing/landing-ambient-background";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHeroPreview } from "@/components/landing/landing-hero-preview";
import { LandingSkillRadarDemo } from "@/components/landing/landing-skill-radar-demo";
import { SectionReveal } from "@/components/landing/section-reveal";
import type { Metadata } from "next";

import { resolveRuntimeCatalog } from "@/lib/learning/runtime-content";
import { mapRuntimeCatalogToMissions } from "@/lib/missions/runtime-missions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "SkillPath Academy — QA, BA & DA Career Tracks",
  description: "Structured learning paths for QA Engineers, Business Analysts, and Data Analysts. Learn with missions, quizzes, and AI-powered feedback.",
  openGraph: {
    title: "SkillPath Academy",
    description: "Role-focused career tracks for QA, BA, and DA professionals.",
    type: "website",
  },
};

const valueProps = [
  {
    icon: Target,
    title: "Role-focused tracks",
    description: "QA, BA, DA, and PM paths built around real job requirements.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: Rocket,
    title: "Real-world missions",
    description: "Practice on scenarios that mirror actual product-team work.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: Bot,
    title: "AI mentor guidance",
    description: "Personalised path, review feedback, and interview prep.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: LineChart,
    title: "Career readiness score",
    description: "Track your progress toward job-ready with clear metrics.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

const howItWorks = [
  {
    icon: Compass,
    title: "Choose a career track",
    description: "Pick QA, BA, DA, or PM and get a clear roadmap with milestones.",
  },
  {
    icon: GraduationCap,
    title: "Complete interactive modules",
    description: "Learn through lessons, quizzes, mini challenges, and smart progress feedback.",
  },
  {
    icon: Rocket,
    title: "Solve real-world missions",
    description: "Practice in realistic scenarios that feel like actual product-team work.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Prepare for interviews",
    description: "Get readiness insights, AI review, and role-focused mock interview support.",
  },
];

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

const roadmapStages = [
  { title: "Beginner", description: "Set target role and baseline skills.", unlock: "Personal onboarding profile" },
  { title: "Foundations", description: "Build core concepts across track modules.", unlock: "First core badge" },
  { title: "Practice", description: "Complete quizzes and guided exercises.", unlock: "Track confidence score" },
  { title: "Missions", description: "Solve realistic role-based scenarios.", unlock: "Real-work portfolio items" },
  { title: "Interview Ready", description: "Run mock interviews and remediation.", unlock: "Interview readiness report" },
  { title: "Job Ready", description: "Close remaining skill gaps and apply.", unlock: "Career action plan" },
];

const outcomes = [
  "Write strong bug reports and acceptance criteria",
  "Build SQL analyses and explain product metrics",
  "Handle role-based scenarios before your first job",
  "Prepare for interviews with AI mentor feedback",
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Best for local demo and personal exploration.",
    features: ["1 career track", "Core modules", "Basic quizzes", "Progress tracking"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro Learner",
    price: "$29",
    period: "/ mo",
    description: "Full access to tracks, missions, and AI guidance.",
    features: ["All career tracks", "Real-world missions", "AI mentor feedback", "Interview prep", "Portfolio builder", "Priority support"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Team Academy",
    price: "Custom",
    description: "Builder workflows and analytics for cohorts.",
    features: ["Unlimited members", "Admin studio", "Analytics dashboard", "Custom tracks", "Cohort progress", "Dedicated support"],
    cta: "Contact us",
    highlight: false,
  },
];

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

function normalizeMissionStatus(status: string) {
  if (status === "in_progress") return "In progress";
  if (status === "locked") return "Locked";
  return "Available";
}

function missionAccentByCategory(category: string) {
  if (category === "QA") return "border-emerald-400/25 bg-emerald-500/8";
  if (category === "BA") return "border-orange-400/25 bg-orange-500/8";
  if (category === "DA") return "border-violet-400/25 bg-violet-500/8";
  return "border-sky-400/25 bg-sky-500/8";
}

function missionStatusColor(status: string) {
  if (status === "In progress" || status === "in_progress")
    return "border-sky-400/30 bg-sky-500/10 text-sky-300";
  if (status === "locked")
    return "border-border/60 bg-card/50 text-muted-foreground";
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
}

export default async function HomePage() {
  const catalog = await resolveRuntimeCatalog({ includeCourseEntities: true });

  const dynamicTracks = catalog.courses
    .filter((course) => course.category === "QA" || course.category === "BA" || course.category === "DA" || course.category === "PRODUCT")
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
      missions: course.modules.reduce((sum, moduleItem) => sum + moduleItem.missions.length, 0) || course.modules.length,
      skills: course.tags.slice(0, 3).length > 0 ? course.tags.slice(0, 3) : skillHintsByCategory(course.category),
      description: course.shortDescription || course.description,
    }));

  const tracks = dynamicTracks.length > 0 ? dynamicTracks : fallbackTracks;

  const dynamicMissionCards = mapRuntimeCatalogToMissions(catalog).slice(0, 3).map((mission) => ({
    title: mission.title,
    scenario: mission.scenario,
    xp: mission.xpReward,
    status: normalizeMissionStatus(mission.status),
    category: "QA",
    accent: missionAccentByCategory("QA"),
    dot: "bg-sky-400",
  }));

  const missions = dynamicMissionCards.length > 0 ? dynamicMissionCards : fallbackMissions;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <LandingAmbientBackground />

      <div className="mx-auto w-full max-w-[112rem] px-3 pb-14 sm:px-5 lg:px-7">
        <LandingHeader />

        <main className="space-y-20 pb-16 pt-8 sm:space-y-24 sm:pt-12">

          {/* ── Hero ─────────────────────────────────────── */}
          <SectionReveal>
            <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/8 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Build real-world skills
                </div>
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12]">
                  Launch your tech career with{" "}
                  <span className="bg-gradient-to-br from-sky-300 via-sky-200 to-violet-300 bg-clip-text text-transparent">
                    modules, missions,
                  </span>{" "}
                  and AI mentoring
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  SkillPath Academy combines practical learning, progression systems, and career guidance in one premium workspace.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
                    Start learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#tracks" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                    Explore tracks
                  </a>
                  <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "text-muted-foreground")}>
                    Try demo
                  </Link>
                </div>
              </div>
              <LandingHeroPreview />
            </section>
          </SectionReveal>

          {/* ── Value props ──────────────────────────────── */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {valueProps.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <SectionReveal key={prop.title} delay={i * 0.08}>
                  <article
                    className={cn(
                      "surface-panel surface-panel-hover flex flex-col gap-3 p-5",
                    )}
                  >
                    <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl border", prop.bg)}>
                      <Icon className={cn("h-4 w-4", prop.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{prop.description}</p>
                    </div>
                  </article>
                </SectionReveal>
              );
            })}
          </section>

          {/* ── How it works ─────────────────────────────── */}
          <SectionReveal>
            <section className="space-y-8">
              <div className="section-header">
                <p className="kicker">How it works</p>
                <h2 className="section-title">Four steps to career readiness</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {howItWorks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="surface-subtle relative p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="step-number">{index + 1}</span>
                        <div className="h-px flex-1 bg-border" />
                        <Icon className="h-4 w-4 text-sky-400" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          </SectionReveal>

          {/* ── Tracks ───────────────────────────────────── */}
          <SectionReveal>
            <section id="tracks" className="space-y-8">
              <div className="flex items-end justify-between gap-4">
                <div className="section-header">
                  <p className="kicker">Career tracks</p>
                  <h2 className="section-title">Choose your role-focused path</h2>
                </div>
                <Link href="/tracks" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden shrink-0 sm:inline-flex")}>
                  All tracks
                </Link>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {tracks.map((track) => (
                  <article
                    key={track.title}
                    className={cn("surface-panel-hover flex flex-col gap-4 rounded-2xl border p-5", track.accent)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", track.dot)} />
                          <span className={cn("text-xs font-semibold uppercase tracking-[0.14em]", track.iconColor)}>
                            {track.category}
                          </span>
                        </div>
                        <h3 className="mt-1.5 text-base font-semibold text-foreground">{track.title}</h3>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{track.description}</p>
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
                    <Link href={track.href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-auto w-full")}>
                      Explore track
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </SectionReveal>

          {/* ── Product preview ──────────────────────────── */}
          <SectionReveal>
            <section className="surface-elevated space-y-6 p-5 sm:p-7">
              <div className="section-header">
                <p className="kicker">Product preview</p>
                <h2 className="section-title">A premium learning command center</h2>
              </div>
              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="content-card rounded-2xl p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="stat-card">
                      <p className="stat-card-label">Total XP</p>
                      <p className="stat-card-value mt-1 text-xl">1,840</p>
                    </div>
                    <div className="stat-card">
                      <p className="stat-card-label">Active track</p>
                      <p className="stat-card-value mt-1 text-base">QA Engineer</p>
                    </div>
                    <div className="stat-card">
                      <p className="stat-card-label">Quiz accuracy</p>
                      <p className="stat-card-value mt-1 text-xl">82%</p>
                    </div>
                  </div>
                  <div className="mini-stat-box mt-3 p-4">
                    <p className="text-sm font-semibold text-foreground">Dashboard widgets</p>
                    <p className="mt-1 text-xs text-muted-foreground">Heatmap, radar, recommendations, and weekly quest cards.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {["Track cards", "Mission cards", "Progress widgets"].map((label, i) => (
                    <article key={label} className="stat-card flex items-start gap-3 p-4">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-sky-400/70" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {i === 0 && "Progress, next module, and ETA in one glance."}
                          {i === 1 && "Scenario, XP reward, and status-driven actions."}
                          {i === 2 && "Level growth, streak, and readiness insights."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* ── Skill radar demo ─────────────────────────── */}
          <SectionReveal>
            <LandingSkillRadarDemo />
          </SectionReveal>

          {/* ── Career roadmap ───────────────────────────── */}
          <SectionReveal>
            <section id="career" className="space-y-8">
              <div className="section-header">
                <p className="kicker">Career path visual map</p>
                <h2 className="section-title">From beginner to job-ready</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {roadmapStages.map((stage, index) => (
                  <SectionReveal key={stage.title} delay={index * 0.06}>
                    <article className="surface-subtle surface-panel-hover p-5">
                      <div className="flex items-center gap-2.5">
                        <span className="step-number">{index + 1}</span>
                        <h3 className="text-base font-semibold text-foreground">{stage.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.description}</p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                        <span className="text-xs text-muted-foreground">
                          Unlock: <span className="text-foreground">{stage.unlock}</span>
                        </span>
                      </div>
                    </article>
                  </SectionReveal>
                ))}
              </div>
            </section>
          </SectionReveal>

          {/* ── AI mentor ────────────────────────────────── */}
          <SectionReveal>
            <section className="surface-elevated grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
              <div className="flex flex-col justify-center space-y-4">
                <div className="section-header">
                  <p className="kicker">AI mentor onboarding</p>
                  <h2 className="section-title">Personalised guidance from day one</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Tell SkillPath your target role and weekly time. AI mentor builds a practical path and adapts it as you progress.
                </p>
                <Link href="/login" className={cn(buttonVariants({ variant: "accent", size: "sm" }), "w-fit gap-2")}>
                  <Bot className="h-3.5 w-3.5" />
                  Ask AI mentor
                </Link>
              </div>
              <div className="content-card space-y-2.5 rounded-2xl p-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border/60 bg-card px-3.5 py-2.5 text-sm text-foreground">
                    I want to become a QA engineer.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-violet-400/20 bg-violet-500/10 px-3.5 py-2.5 text-sm text-violet-100">
                    Great goal. How many hours can you study each week?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border/60 bg-card px-3.5 py-2.5 text-sm text-foreground">
                    Around 7 hours.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-sky-400/20 bg-sky-500/10 px-3.5 py-2.5 text-sm leading-relaxed text-sky-100">
                    Recommended path: QA Foundations → API Testing → Bug Tracker Simulation → Mock Interview.
                  </div>
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* ── Missions ─────────────────────────────────── */}
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
                    className={cn("surface-panel-hover flex flex-col gap-4 rounded-2xl border p-5", mission.accent)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", mission.dot)} />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {mission.category}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{mission.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{mission.scenario}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
                        +{mission.xp} XP
                      </span>
                      <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-semibold", missionStatusColor(mission.status))}>
                        {mission.status}
                      </span>
                    </div>
                    <Link href="/missions" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-auto w-full")}>
                      Open mission
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </SectionReveal>

          {/* ── Outcomes ─────────────────────────────────── */}
          <SectionReveal>
            <section id="about" className="surface-elevated p-5 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="section-header">
                  <p className="kicker">Outcomes</p>
                  <h2 className="section-title">What you will be able to do</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Built around the skills that actually matter in QA, BA, and DA roles.
                  </p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="content-card flex items-start gap-3 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="text-sm text-foreground">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </SectionReveal>

          {/* ── Pricing ──────────────────────────────────── */}
          <SectionReveal>
            <section id="pricing" className="space-y-8">
              <div className="section-header">
                <p className="kicker">Pricing</p>
                <h2 className="section-title">Simple plans for every stage</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {pricingPlans.map((plan, i) => (
                  <SectionReveal key={plan.name} delay={i * 0.1}>
                  <article
                    className={cn(
                      "relative flex flex-col gap-5 rounded-2xl border p-6",
                      plan.highlight
                        ? "border-sky-400/35 bg-gradient-to-b from-sky-500/10 to-slate-900/70 shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_16px_40px_rgba(2,6,23,0.42)]"
                        : "surface-subtle",
                    )}
                  >
                    {plan.highlight ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-0.5 text-xs font-semibold text-sky-300">
                          <Sparkles className="h-3 w-3" />
                          Most popular
                        </span>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight text-foreground">{plan.price}</span>
                        {plan.period ? (
                          <span className="text-sm text-muted-foreground">{plan.period}</span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    <ul className="flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/login"
                      className={cn(
                        plan.highlight
                          ? buttonVariants({ size: "sm" })
                          : buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full",
                      )}
                    >
                      {plan.cta}
                    </Link>
                  </article>
                  </SectionReveal>
                ))}
              </div>
            </section>
          </SectionReveal>

          {/* ── Final CTA ────────────────────────────────── */}
          <SectionReveal>
            <section className="relative overflow-hidden rounded-[28px] border border-sky-400/15 bg-gradient-to-br from-slate-900/90 via-indigo-950/60 to-slate-950/90 p-8 text-center shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_24px_60px_rgba(2,6,23,0.5)] sm:p-12">
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-[-40px] h-[320px] w-[320px] rounded-full bg-sky-500/12 blur-3xl" />
                <div className="absolute -right-24 bottom-[-40px] h-[320px] w-[320px] rounded-full bg-violet-500/12 blur-3xl" />
              </div>
              <div className="relative space-y-4">
                <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Build your skills.{" "}
                  <span className="bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
                    Grow your career.
                  </span>
                </h2>
                <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
                  Start your learning journey today with role-based tracks, missions, and AI-powered feedback.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-[0_10px_30px_rgba(56,189,248,0.3)]")}>
                    Start learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                    Try demo
                  </Link>
                </div>
              </div>
            </section>
          </SectionReveal>
        </main>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t border-border/70 py-10">
          <div className="grid gap-8 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/15 text-sky-200">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <p className="font-semibold text-foreground">SkillPath Academy</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Premium local-first EdTech workspace for QA, BA, and DA careers.</p>
            </div>
            <div className="space-y-2">
              <p className="module-order-label font-semibold">Product</p>
              <Link href="/tracks" className="block transition-colors hover:text-foreground">Tracks</Link>
              <Link href="/missions" className="block transition-colors hover:text-foreground">Missions</Link>
              <Link href="/career" className="block transition-colors hover:text-foreground">Career</Link>
            </div>
            <div className="space-y-2">
              <p className="module-order-label font-semibold">AI & Learning</p>
              <Link href="/dashboard" className="block transition-colors hover:text-foreground">Dashboard</Link>
              <Link href="/interview" className="block transition-colors hover:text-foreground">AI interview</Link>
              <Link href="/planner" className="block transition-colors hover:text-foreground">Planner</Link>
            </div>
            <div className="space-y-2">
              <p className="module-order-label font-semibold">Company</p>
              <a href="#about" className="block transition-colors hover:text-foreground">About</a>
              <a href="#pricing" className="block transition-colors hover:text-foreground">Pricing</a>
              <Link href="/login" className="block transition-colors hover:text-foreground">Contact</Link>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} SkillPath Academy. Local edition.</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>All systems operational</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
