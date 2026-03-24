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
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LandingAmbientBackground } from "@/components/landing/landing-ambient-background";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHeroPreview } from "@/components/landing/landing-hero-preview";
import { LandingSkillRadarDemo } from "@/components/landing/landing-skill-radar-demo";
import { SectionReveal } from "@/components/landing/section-reveal";
import { resolveRuntimeCatalog } from "@/lib/learning/runtime-content";
import { mapRuntimeCatalogToMissions } from "@/lib/missions/runtime-missions";

const valueChips = ["Practical learning", "AI guidance", "Career readiness", "Real missions"];

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
  },
  {
    title: "Stakeholder Request to User Story",
    scenario: "Convert a vague request into clear acceptance criteria and testable scope.",
    xp: 120,
    status: "Available",
  },
  {
    title: "Retention Dataset Deep Dive",
    scenario: "Analyze churn signals and propose 3 high-impact product actions.",
    xp: 180,
    status: "Locked",
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

function accentByCategory(category: string) {
  if (category === "QA") return "border-emerald-400/30 bg-emerald-500/10";
  if (category === "BA") return "border-orange-400/30 bg-orange-500/10";
  if (category === "DA") return "border-violet-400/30 bg-violet-500/10";
  return "border-sky-400/30 bg-sky-500/10";
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
  }));

  const missions = dynamicMissionCards.length > 0 ? dynamicMissionCards : fallbackMissions;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <LandingAmbientBackground />

      <div className="mx-auto w-full max-w-[112rem] px-3 pb-14 sm:px-5 lg:px-7">
        <LandingHeader />

        <main className="space-y-16 pb-16 pt-8 sm:space-y-20 sm:pt-10">
          <SectionReveal>
            <section className="grid items-center gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10">
              <div className="space-y-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/35 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Build real-world skills
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
                  Launch your tech career with modules, missions, and AI mentoring
                </h1>
                <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                  SkillPath Academy combines practical learning, progression systems, and career guidance in one premium local workspace.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
                    Start learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <a href="#tracks" className={cn(buttonVariants({ variant: "outline" }), "h-11 border-slate-700 px-6")}>
                    Explore tracks
                  </a>
                  <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "h-11 px-4")}>
                    Try demo
                  </Link>
                </div>
              </div>
              <LandingHeroPreview />
            </section>
          </SectionReveal>

          <SectionReveal>
            <section className="surface-elevated p-4 sm:p-5">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {valueChips.map((chip) => (
                  <span key={chip} className="inline-flex items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/65 px-3 py-2 text-sm text-slate-200">
                    {chip}
                  </span>
                ))}
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section className="space-y-5">
              <div className="space-y-2">
                <p className="kicker">How it works</p>
                <h2 className="section-title">How SkillPath works</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {howItWorks.map((item) => (
                  <article key={item.title} className="surface-subtle surface-panel-hover p-5">
                    <item.icon className="h-5 w-5 text-sky-300" />
                    <h3 className="mt-3 text-lg font-semibold text-slate-100">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section id="tracks" className="space-y-5">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-2">
                  <p className="kicker">Career tracks</p>
                  <h2 className="section-title">Choose your role-focused path</h2>
                </div>
                <Link href="/tracks" className={cn(buttonVariants({ variant: "outline" }), "hidden h-9 border-slate-700 px-4 sm:inline-flex")}>
                  Open tracks
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {tracks.map((track) => (
                  <article key={track.title} className={cn("surface-panel-hover space-y-4 rounded-2xl border p-4", track.accent)}>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">{track.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{track.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg border border-slate-800 bg-slate-900/65 p-2">
                        <p className="text-slate-500">Duration</p>
                        <p className="mt-1 text-slate-100">{track.duration}</p>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-900/65 p-2">
                        <p className="text-slate-500">Modules</p>
                        <p className="mt-1 text-slate-100">{track.modules}</p>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-900/65 p-2">
                        <p className="text-slate-500">Missions</p>
                        <p className="mt-1 text-slate-100">{track.missions}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {track.skills.map((skill) => (
                        <span key={skill} className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[11px] text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Link href={track.href} className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full border-slate-700")}>
                      Explore track
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section className="surface-elevated space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="kicker">Product preview</p>
                <h2 className="section-title">A premium learning command center</h2>
              </div>
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs text-slate-500">Total XP</p>
                      <p className="mt-1 text-xl font-semibold text-slate-100">1,840</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs text-slate-500">Active track</p>
                      <p className="mt-1 text-xl font-semibold text-slate-100">QA Engineer</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs text-slate-500">Quiz accuracy</p>
                      <p className="mt-1 text-xl font-semibold text-slate-100">82%</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-sm font-semibold text-slate-100">Dashboard widgets</p>
                    <p className="mt-1 text-xs text-slate-400">Heatmap, radar, recommendations, and weekly quest cards.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-slate-100">Track cards</p>
                    <p className="mt-1 text-xs text-slate-400">Progress, next module, and ETA in one glance.</p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-slate-100">Mission cards</p>
                    <p className="mt-1 text-xs text-slate-400">Scenario, XP reward, and status-driven actions.</p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-slate-100">Progress widgets</p>
                    <p className="mt-1 text-xs text-slate-400">Level growth, streak, and readiness insights.</p>
                  </article>
                </div>
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <LandingSkillRadarDemo />
          </SectionReveal>

          <SectionReveal>
            <section id="career" className="space-y-5">
              <div className="space-y-2">
                <p className="kicker">Career path visual map</p>
                <h2 className="section-title">From beginner to job-ready</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {roadmapStages.map((stage, index) => (
                  <article key={stage.title} className="surface-subtle surface-panel-hover relative p-4">
                    <span className="absolute -left-2 top-5 hidden h-2 w-2 rounded-full bg-sky-400 xl:block" />
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Stage {index + 1}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-100">{stage.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{stage.description}</p>
                    <p className="mt-2 inline-flex rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[11px] text-slate-300">
                      Unlock: {stage.unlock}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section className="surface-elevated grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3">
                <p className="kicker">AI mentor onboarding</p>
                <h2 className="section-title">Personalized guidance from day one</h2>
                <p className="text-sm text-slate-400">
                  Tell SkillPath your target role and weekly time. AI mentor builds a practical path and adapts it as you progress.
                </p>
                <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "h-9 px-4")}>
                  Ask AI mentor
                </Link>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
                  I want to become a QA engineer.
                </div>
                <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 text-sm text-violet-100">
                  Great goal. How many hours can you study each week?
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
                  Around 7 hours.
                </div>
                <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-3 text-sm text-sky-100">
                  Recommended path: QA Foundations → API Testing → Bug Tracker Simulation → Mock Interview.
                </div>
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section id="missions" className="space-y-5">
              <div className="space-y-2">
                <p className="kicker">Real-world missions</p>
                <h2 className="section-title">Practice with scenarios that mirror real teams</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {missions.map((mission) => (
                  <article key={mission.title} className="surface-subtle surface-panel-hover space-y-3 p-4">
                    <h3 className="text-base font-semibold text-slate-100">{mission.title}</h3>
                    <p className="line-clamp-2 text-sm text-slate-400">{mission.scenario}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-violet-200">
                        +{mission.xp} XP
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-slate-300">
                        {mission.status}
                      </span>
                    </div>
                    <Link href="/missions" className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full border-slate-700")}>
                      Open mission
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section id="about" className="surface-elevated space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="kicker">Outcomes</p>
                <h2 className="section-title">What you will be able to do</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {outcomes.map((outcome) => (
                  <article key={outcome} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="inline-flex items-start gap-2 text-sm text-slate-200">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      {outcome}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section id="pricing" className="space-y-5">
              <div className="space-y-2">
                <p className="kicker">Pricing</p>
                <h2 className="section-title">Simple plans for local and team learning</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <article className="surface-subtle p-4">
                  <p className="text-sm font-semibold text-slate-100">Starter</p>
                  <p className="mt-1 text-xs text-slate-400">Best for local demo and personal practice.</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-100">Local</p>
                </article>
                <article className="surface-subtle p-4">
                  <p className="text-sm font-semibold text-slate-100">Pro learner</p>
                  <p className="mt-1 text-xs text-slate-400">Track progression, missions, and AI guidance.</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-100">$29</p>
                </article>
                <article className="surface-subtle p-4">
                  <p className="text-sm font-semibold text-slate-100">Team Academy</p>
                  <p className="mt-1 text-xs text-slate-400">Builder workflows and analytics for cohorts.</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-100">Custom</p>
                </article>
              </div>
            </section>
          </SectionReveal>

          <SectionReveal>
            <section className="surface-elevated text-center p-7 sm:p-10">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
                Build your skills. Grow your career.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
                Start your learning journey today with role-based tracks, missions, and AI-powered feedback.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
                  Start learning
                </Link>
                <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "h-11 border-slate-700 px-6")}>
                  Try demo
                </Link>
              </div>
            </section>
          </SectionReveal>
        </main>

        <footer className="border-t border-slate-800/80 py-8">
          <div className="grid gap-6 text-sm text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-semibold text-slate-200">SkillPath Academy</p>
              <p className="mt-2 text-xs text-slate-500">Premium local-first EdTech workspace.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">Product</p>
              <Link href="/tracks" className="block hover:text-slate-200">Tracks</Link>
              <Link href="/missions" className="block hover:text-slate-200">Missions</Link>
              <Link href="/career" className="block hover:text-slate-200">Career</Link>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">AI & Learning</p>
              <Link href="/dashboard" className="block hover:text-slate-200">Dashboard</Link>
              <Link href="/interview" className="block hover:text-slate-200">AI interview</Link>
              <Link href="/planner" className="block hover:text-slate-200">Planner</Link>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">Company</p>
              <a href="#about" className="block hover:text-slate-200">About</a>
              <a href="#pricing" className="block hover:text-slate-200">Pricing</a>
              <Link href="/login" className="block hover:text-slate-200">Contact</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} SkillPath Academy. Local edition.</p>
        </footer>
      </div>
    </div>
  );
}
