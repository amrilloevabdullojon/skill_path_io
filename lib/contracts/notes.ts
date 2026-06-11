import { z } from "zod";

/** Contract for `/api/v1/notes` — the learner's study notes. */

export const NoteTrackSchema = z.enum(["QA", "BA", "DA"]);
export type NoteTrack = z.infer<typeof NoteTrackSchema>;

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  track: NoteTrackSchema,
  lessonRef: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Note = z.infer<typeof NoteSchema>;

export const ListNotesResponseSchema = z.object({
  notes: z.array(NoteSchema),
});

export const CreateNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  content: z.string().trim().min(1, "content is required").max(10_000),
  track: NoteTrackSchema.default("QA"),
  lessonRef: z.string().trim().max(200).default("Manual note"),
});
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;

export const CreateNoteResponseSchema = z.object({
  note: NoteSchema,
});

export const DeleteNoteQuerySchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const DeleteNoteResponseSchema = z.object({
  ok: z.boolean(),
});
