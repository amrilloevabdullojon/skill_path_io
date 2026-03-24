export type CommandItem = {
  id: string;
  type: "course" | "module" | "lesson" | "mission" | "job" | "user" | "page" | "action";
  title: string;
  subtitle?: string;
  href: string;
  keywords: string[];
  adminOnly?: boolean;
};

export type CommandRuntimeTrack = {
  slug: string;
  title: string;
  description: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;
};

export type CommandRuntimeMission = {
  id: string;
  title: string;
  roleContext: string;
  category: string;
};

export type CommandRuntimeJob = {
  id: string;
  title: string;
  level: string;
  location: string;
  roleTrack: string;
};

const basePages: CommandItem[] = [
  { id: "page-dashboard", type: "page", title: "Dashboard", href: "/dashboard", keywords: ["home", "dashboard"] },
  { id: "page-tracks", type: "page", title: "Tracks", href: "/tracks", keywords: ["tracks", "courses"] },
  { id: "page-missions", type: "page", title: "Missions", href: "/missions", keywords: ["missions", "practice"] },
  { id: "page-career", type: "page", title: "Career", href: "/career", keywords: ["career", "roadmap"] },
  { id: "page-portfolio", type: "page", title: "Portfolio", href: "/portfolio", keywords: ["portfolio", "artifacts"] },
  { id: "page-jobs", type: "page", title: "Jobs", href: "/jobs", keywords: ["jobs", "career"] },
  { id: "page-marketplace", type: "page", title: "Marketplace", href: "/marketplace", keywords: ["hiring", "marketplace", "roles"] },
  { id: "page-teams", type: "page", title: "Teams", href: "/teams", keywords: ["team", "b2b", "company"] },
  { id: "page-billing", type: "page", title: "Billing", href: "/billing", keywords: ["billing", "plans", "subscription"] },
  { id: "page-advanced-analytics", type: "page", title: "Advanced Analytics", href: "/analytics/advanced", keywords: ["analytics", "advanced", "velocity"] },
  { id: "page-planner", type: "page", title: "Planner", href: "/planner", keywords: ["planner", "plan"] },
  { id: "page-analytics", type: "page", title: "Analytics", href: "/analytics", keywords: ["analytics", "stats"] },
  { id: "page-public-profile", type: "page", title: "Public Profile", href: "/profile/me", keywords: ["profile", "public", "share"] },
];

const actionItems: CommandItem[] = [
  {
    id: "action-open-track",
    type: "action",
    title: "Open track",
    subtitle: "Go to tracks catalog",
    href: "/tracks",
    keywords: ["open track", "start learning", "course"],
  },
  {
    id: "action-start-mission",
    type: "action",
    title: "Start mission",
    subtitle: "Open mission board",
    href: "/missions",
    keywords: ["start mission", "mission", "practice"],
  },
  {
    id: "action-open-roadmap",
    type: "action",
    title: "Open roadmap",
    subtitle: "View career readiness and next stages",
    href: "/career",
    keywords: ["roadmap", "career path", "readiness"],
  },
  {
    id: "action-open-planner",
    type: "action",
    title: "Open planner",
    subtitle: "Review weekly plan",
    href: "/planner",
    keywords: ["planner", "plan", "schedule"],
  },
  {
    id: "action-ask-ai",
    type: "action",
    title: "Ask AI mentor",
    subtitle: "Open AI recommendations section",
    href: "/dashboard?tab=skills#ai",
    keywords: ["ask ai", "mentor", "recommendations"],
  },
];

const adminUsers: CommandItem[] = [
  {
    id: "user-admin",
    type: "user",
    title: "admin@skillpath.local",
    subtitle: "ADMIN user",
    href: "/admin/users",
    keywords: ["admin", "user", "role"],
    adminOnly: true,
  },
  {
    id: "user-student",
    type: "user",
    title: "student@skillpath.local",
    subtitle: "STUDENT user",
    href: "/admin/users",
    keywords: ["student", "user", "role"],
    adminOnly: true,
  },
];

function buildTrackItems(runtimeTracks: CommandRuntimeTrack[]) {
  const courseItems: CommandItem[] = runtimeTracks.map((track) => ({
    id: `course-${track.slug}`,
    type: "course",
    title: track.title,
    subtitle: track.description,
    href: `/tracks/${track.slug}`,
    keywords: [track.title.toLowerCase(), track.slug, "course", "track"],
  }));

  const moduleItems: CommandItem[] = runtimeTracks.flatMap((track) =>
    track.modules.map((moduleItem) => ({
      id: `module-${track.slug}-${moduleItem.id}`,
      type: "module" as const,
      title: moduleItem.title,
      subtitle: track.title,
      href: `/tracks/${track.slug}/modules/${moduleItem.id}`,
      keywords: [moduleItem.title.toLowerCase(), track.title.toLowerCase(), "module"],
    })),
  );

  const lessonItems: CommandItem[] = runtimeTracks.flatMap((track) =>
    track.modules.map((moduleItem) => ({
      id: `lesson-${track.slug}-${moduleItem.id}`,
      type: "lesson" as const,
      title: `${moduleItem.title} lesson`,
      subtitle: track.title,
      href: `/tracks/${track.slug}/modules/${moduleItem.id}`,
      keywords: [moduleItem.title.toLowerCase(), "lesson", track.slug],
    })),
  );

  return {
    courseItems,
    moduleItems,
    lessonItems,
  };
}

function buildMissionItems(missions: CommandRuntimeMission[]): CommandItem[] {
  return missions.map((mission) => ({
    id: mission.id,
    type: "mission" as const,
    title: mission.title,
    subtitle: mission.roleContext,
    href: "/missions",
    keywords: [mission.title.toLowerCase(), mission.category.toLowerCase(), "mission"],
  }));
}

function buildJobItems(jobs: CommandRuntimeJob[]): CommandItem[] {
  return jobs.map((job) => ({
    id: job.id,
    type: "job" as const,
    title: job.title,
    subtitle: `${job.level} - ${job.location}`,
    href: "/jobs",
    keywords: [job.title.toLowerCase(), job.level.toLowerCase(), job.roleTrack.toLowerCase(), "job"],
  }));
}

export function getCommandItems(input?: {
  runtimeTracks?: CommandRuntimeTrack[];
  runtimeMissions?: CommandRuntimeMission[];
  runtimeJobs?: CommandRuntimeJob[];
}) {
  const tracks = input?.runtimeTracks ?? [];
  const { courseItems, moduleItems, lessonItems } = buildTrackItems(tracks);
  const missionItems = buildMissionItems(input?.runtimeMissions ?? []);
  const jobItems = buildJobItems(input?.runtimeJobs ?? []);

  return [
    ...actionItems,
    ...basePages,
    ...courseItems,
    ...moduleItems,
    ...lessonItems,
    ...missionItems,
    ...jobItems,
    ...adminUsers,
  ];
}
