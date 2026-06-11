import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, parseQuery, respond } from "@/lib/api/v1/http";
import {
  CreateNoteResponseSchema,
  CreateNoteSchema,
  DeleteNoteQuerySchema,
  DeleteNoteResponseSchema,
  ListNotesResponseSchema,
} from "@/lib/contracts/notes";
import { createNote, deleteNote, listNotes } from "@/lib/notes/service";

export const runtime = "nodejs";

/** GET /api/v1/notes — list the caller's notes. */
export const GET = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const notes = await listNotes(userId);
  return respond(ListNotesResponseSchema, { notes });
});

/** POST /api/v1/notes — create a note. */
export const POST = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const input = await parseBody(request, CreateNoteSchema);
  const note = await createNote(userId, input);
  return respond(CreateNoteResponseSchema, { note }, 201);
});

/** DELETE /api/v1/notes?id=... — remove one of the caller's notes. */
export const DELETE = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const { id } = parseQuery(request, DeleteNoteQuerySchema);
  await deleteNote(userId, id);
  return respond(DeleteNoteResponseSchema, { ok: true });
});
