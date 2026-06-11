import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { env } from "@/lib/env";

import {
  LoginRequestSchema,
  MeResponseSchema,
  RefreshRequestSchema,
  TokenPairSchema,
} from "@/lib/contracts/auth";
import {
  CreateBookmarkResponseSchema,
  CreateBookmarkSchema,
  DeleteBookmarkQuerySchema,
  DeleteBookmarkResponseSchema,
  ListBookmarksResponseSchema,
} from "@/lib/contracts/bookmarks";
import { ModuleDetailSchema, ModuleParamsSchema } from "@/lib/contracts/modules";
import { QuizAttemptResultSchema, QuizSubmissionSchema } from "@/lib/contracts/quiz";
import {
  TrackDetailSchema,
  TrackParamsSchema,
  TracksCatalogSchema,
  TracksQuerySchema,
} from "@/lib/contracts/tracks";

// Patch zod with the `.openapi()` helper. Safe to call once at module load.
extendZodWithOpenApi(z);

const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  message: z.string(),
});

/** Build the OpenAPI 3.0 document describing the public `/api/v1` surface. */
export function buildOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  const errorResponse = (description: string) => ({
    description,
    content: { "application/json": { schema: ErrorSchema } },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/auth/login",
    tags: ["auth"],
    summary: "Exchange credentials for an access/refresh token pair",
    request: {
      body: { content: { "application/json": { schema: LoginRequestSchema } } },
    },
    responses: {
      200: {
        description: "Token pair",
        content: { "application/json": { schema: TokenPairSchema } },
      },
      401: errorResponse("Invalid credentials"),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/auth/refresh",
    tags: ["auth"],
    summary: "Rotate a refresh token into a new token pair",
    request: {
      body: { content: { "application/json": { schema: RefreshRequestSchema } } },
    },
    responses: {
      200: {
        description: "Token pair",
        content: { "application/json": { schema: TokenPairSchema } },
      },
      401: errorResponse("Invalid or expired refresh token"),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/auth/me",
    tags: ["auth"],
    summary: "Current authenticated user",
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      200: {
        description: "Current user",
        content: { "application/json": { schema: MeResponseSchema } },
      },
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/tracks",
    tags: ["learning"],
    summary: "Published learning catalog (tracks + studio courses)",
    security: [{ [bearerAuth.name]: [] }],
    request: { query: TracksQuerySchema },
    responses: {
      200: {
        description: "Runtime catalog",
        content: { "application/json": { schema: TracksCatalogSchema } },
      },
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/tracks/{slug}",
    tags: ["learning"],
    summary: "A single published track/course with its modules",
    security: [{ [bearerAuth.name]: [] }],
    request: { params: TrackParamsSchema, query: TracksQuerySchema },
    responses: {
      200: {
        description: "Track detail",
        content: { "application/json": { schema: TrackDetailSchema } },
      },
      401: errorResponse("Authentication required"),
      404: errorResponse("Track not found"),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/tracks/{slug}/modules/{moduleId}",
    tags: ["learning"],
    summary: "A single module's learner view (no quiz answers)",
    security: [{ [bearerAuth.name]: [] }],
    request: { params: ModuleParamsSchema, query: TracksQuerySchema },
    responses: {
      200: {
        description: "Module detail",
        content: { "application/json": { schema: ModuleDetailSchema } },
      },
      401: errorResponse("Authentication required"),
      404: errorResponse("Track or module not found"),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/tracks/{slug}/modules/{moduleId}/quiz/attempts",
    tags: ["learning"],
    summary: "Submit quiz answers and record a graded attempt",
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: ModuleParamsSchema,
      body: { content: { "application/json": { schema: QuizSubmissionSchema } } },
    },
    responses: {
      200: {
        description: "Graded attempt result",
        content: { "application/json": { schema: QuizAttemptResultSchema } },
      },
      400: errorResponse("Invalid submission"),
      401: errorResponse("Authentication required"),
      404: errorResponse("Quiz not found"),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/bookmarks",
    tags: ["bookmarks"],
    summary: "List the caller's bookmarks",
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      200: {
        description: "Bookmarks",
        content: { "application/json": { schema: ListBookmarksResponseSchema } },
      },
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/bookmarks",
    tags: ["bookmarks"],
    summary: "Create a bookmark (idempotent on title+href)",
    security: [{ [bearerAuth.name]: [] }],
    request: {
      body: { content: { "application/json": { schema: CreateBookmarkSchema } } },
    },
    responses: {
      201: {
        description: "Created bookmark",
        content: { "application/json": { schema: CreateBookmarkResponseSchema } },
      },
      200: {
        description: "Existing bookmark",
        content: { "application/json": { schema: CreateBookmarkResponseSchema } },
      },
      400: errorResponse("Validation error"),
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/v1/bookmarks",
    tags: ["bookmarks"],
    summary: "Delete one of the caller's bookmarks",
    security: [{ [bearerAuth.name]: [] }],
    request: { query: DeleteBookmarkQuerySchema },
    responses: {
      200: {
        description: "Deletion result",
        content: { "application/json": { schema: DeleteBookmarkResponseSchema } },
      },
      401: errorResponse("Authentication required"),
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Levio API",
      version: "1.0.0",
      description: "Versioned REST API consumed by the Levio web and mobile clients.",
    },
    servers: [{ url: env.APP_URL }],
  });
}
