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
  { id: "page-today", type: "page", title: "Today", href: "/dashboard", keywords: ["home", "dashboard", "today"] },
  { id: "page-study", type: "page", title: "Study", href: "/tracks", keywords: ["tracks", "courses", "study", "learning"] },
  { id: "page-practice", type: "page", title: "Practice", href: "/missions", keywords: ["missions", "practice"] },
  { id: "page-progress", type: "page", title: "Progress", href: "/dashboard?tab=skills", keywords: ["progress", "skills", "stats"] },
  { id: "page-portfolio", type: "page", title: "Portfolio", href: "/portfolio", keywords: ["portfolio", "artifacts"] },
];

const actionItems: CommandItem[] = [
  {
    id: "action-open-track",
    type: "action",
    title: "Open study path",
    subtitle: "Go to tracks catalog",
    href: "/tracks",
    keywords: ["open track", "start learning", "course", "study"],
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
    id: "action-review-progress",
    type: "action",
    title: "Review progress",
    subtitle: "Open your skill progress",
    href: "/dashboard?tab=skills",
    keywords: ["progress", "skills", "readiness"],
  },
  {
    id: "action-open-portfolio",
    type: "action",
    title: "Open portfolio",
    subtitle: "Review saved work artifacts",
    href: "/portfolio",
    keywords: ["portfolio", "artifacts", "work"],
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
    title: "admin@levio.local",
    subtitle: "ADMIN user",
    href: "/admin/users",
    keywords: ["admin", "user", "role"],
    adminOnly: true,
  },
  {
    id: "user-student",
    type: "user",
    title: "student@levio.local",
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

export function getCommandItems(input?: {
  runtimeTracks?: CommandRuntimeTrack[];
  runtimeMissions?: CommandRuntimeMission[];
  runtimeJobs?: CommandRuntimeJob[];
}) {
  const tracks = input?.runtimeTracks ?? [];
  const { courseItems, moduleItems, lessonItems } = buildTrackItems(tracks);
  const missionItems = buildMissionItems(input?.runtimeMissions ?? []);

  return [
    ...actionItems,
    ...basePages,
    ...courseItems,
    ...moduleItems,
    ...lessonItems,
    ...missionItems,
    ...adminUsers,
  ];
}
