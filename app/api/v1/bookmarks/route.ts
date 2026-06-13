import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, parseQuery, respond } from "@/lib/api/v1/http";
import { createBookmark, deleteBookmark, listBookmarks } from "@/lib/bookmarks/service";
import {
  CreateBookmarkResponseSchema,
  CreateBookmarkSchema,
  DeleteBookmarkQuerySchema,
  DeleteBookmarkResponseSchema,
  ListBookmarksResponseSchema,
} from "@/lib/contracts/bookmarks";

export const runtime = "nodejs";

/** GET /api/v1/bookmarks — list the caller's bookmarks. */
export const GET = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const bookmarks = await listBookmarks(userId);
  return respond(ListBookmarksResponseSchema, { bookmarks });
});

/** POST /api/v1/bookmarks — create (or return the existing) bookmark. */
export const POST = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const input = await parseBody(request, CreateBookmarkSchema);
  const { bookmark, created } = await createBookmark(userId, input);
  return respond(CreateBookmarkResponseSchema, { bookmark }, created ? 201 : 200);
});

/** DELETE /api/v1/bookmarks?id=... — remove one of the caller's bookmarks. */
export const DELETE = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const { id } = parseQuery(request, DeleteBookmarkQuerySchema);
  await deleteBookmark(userId, id);
  return respond(DeleteBookmarkResponseSchema, { ok: true });
});
