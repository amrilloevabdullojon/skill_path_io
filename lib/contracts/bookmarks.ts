import { z } from "zod";

/** Contract for `/api/v1/bookmarks` — the learner's saved study material. */

export const BookmarkTypeSchema = z.enum(["lesson", "module", "quiz", "mission"]);
export type BookmarkType = z.infer<typeof BookmarkTypeSchema>;

export const BookmarkSchema = z.object({
  id: z.string(),
  title: z.string(),
  href: z.string(),
  type: BookmarkTypeSchema,
  tag: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Bookmark = z.infer<typeof BookmarkSchema>;

export const ListBookmarksResponseSchema = z.object({
  bookmarks: z.array(BookmarkSchema),
});

export const CreateBookmarkSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  href: z
    .string()
    .trim()
    .min(1, "href is required")
    .max(500)
    .regex(/^(\/|https?:\/\/)/, "href must be a relative path or https URL"),
  type: BookmarkTypeSchema.default("lesson"),
  tag: z.string().trim().max(50).default("General"),
});
export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;

export const CreateBookmarkResponseSchema = z.object({
  bookmark: BookmarkSchema,
});

export const DeleteBookmarkQuerySchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const DeleteBookmarkResponseSchema = z.object({
  ok: z.boolean(),
});
