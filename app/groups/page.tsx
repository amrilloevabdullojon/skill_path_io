import { getServerSession } from "next-auth";

import { GroupsHub } from "@/components/groups/groups-hub";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudyGroup } from "@/types/personalization";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);
  const [tracks, threads, userCount] = session?.user?.email
    ? await Promise.all([
        prisma.track.findMany({
          orderBy: { title: "asc" },
          select: {
            id: true,
            title: true,
            category: true,
          },
          take: 20,
        }),
        prisma.discussionThread.findMany({
          select: {
            track: true,
          },
          take: 200,
        }),
        prisma.user.count(),
      ])
    : [[], [], 0];

  const groupsFromTracks: StudyGroup[] = tracks.map((track, index) => {
    const relatedThreads = threads.filter((thread) => thread.track === track.category).length;
    return {
      id: `group-track-${track.id}`,
      name: `${track.title} Circle`,
      topic: `${track.category} track community`,
      members: Math.max(3, Math.min(userCount, 5 + relatedThreads * 2)),
      description: `Peer study sessions, module debriefs, and mission help for ${track.title}.`,
      mode: index % 3 === 0 ? "Invite" : "Open",
    };
  });

  const groups: StudyGroup[] = groupsFromTracks.length > 0
    ? groupsFromTracks
    : [
        {
          id: "group-general",
          name: "General Learners Hub",
          topic: "Cross-track collaboration",
          members: 1,
          description: "General study and peer support space.",
          mode: "Open",
        },
      ];

  return (
    <section className="page-shell">
      <GroupsHub groups={groups} />
    </section>
  );
}
