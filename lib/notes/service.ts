import {
  NoteTrackSchema,
  type CreateNoteInput,
  type Note,
  type NoteTrack,
} from "@/lib/contracts/notes";
import { prisma } from "@/lib/prisma";

/**
 * Notes domain service. Framework-agnostic; returns contract DTOs (ISO dates,
 * track parsed from the stored moduleRef) so the HTTP handler stays thin.
 */

const MAX_NOTES = 120;

type NoteRow = {
  id: string;
  title: string;
  content: string;
  moduleRef: string;
  lessonRef: string;
  createdAt: Date;
  updatedAt: Date;
};

function parseTrack(moduleRef: string): NoteTrack {
  const candidate = moduleRef.startsWith("track:") ? moduleRef.slice("track:".length) : moduleRef;
  return NoteTrackSchema.safeParse(candidate).success ? (candidate as NoteTrack) : "QA";
}

function toDto(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    track: parseTrack(row.moduleRef),
    lessonRef: row.lessonRef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listNotes(userId: string): Promise<Note[]> {
  const rows = await prisma.userNote.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: MAX_NOTES,
  });
  return rows.map(toDto);
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<Note> {
  const row = await prisma.userNote.create({
    data: {
      userId,
      title: input.title,
      content: input.content,
      moduleRef: `track:${input.track}`,
      lessonRef: input.lessonRef,
    },
  });
  return toDto(row);
}

export async function deleteNote(userId: string, id: string): Promise<void> {
  await prisma.userNote.deleteMany({ where: { id, userId } });
}
