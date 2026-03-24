import { getServerSession } from "next-auth";

import { NotesBoard } from "@/components/notes/notes-board";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserNote } from "@/types/personalization";

function mapTrack(moduleRef: string): UserNote["track"] {
  const normalized = moduleRef.toLowerCase();
  if (normalized.includes("ba") || normalized.includes("business")) {
    return "BA";
  }
  if (normalized.includes("data") || normalized.includes("sql")) {
    return "DA";
  }
  return "QA";
}

export default async function NotesPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
    : null;
  const rows = user
    ? await prisma.userNote.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 80,
      })
    : [];

  const initialNotes: UserNote[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    track: mapTrack(row.moduleRef),
    lessonRef: row.lessonRef || row.moduleRef || "General note",
    createdAt: row.createdAt.toISOString(),
  }));

  return (
    <section className="page-shell">
      <NotesBoard initialNotes={initialNotes} />
    </section>
  );
}
