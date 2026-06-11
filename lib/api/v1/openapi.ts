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
  OkResponseSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from "@/lib/contracts/account";
import { RegisterRequestSchema } from "@/lib/contracts/register";
import {
  CreateBookmarkResponseSchema,
  CreateBookmarkSchema,
  DeleteBookmarkQuerySchema,
  DeleteBookmarkResponseSchema,
  ListBookmarksResponseSchema,
} from "@/lib/contracts/bookmarks";
import {
  MissionParamsSchema,
  MissionSubmissionResultSchema,
  MissionSubmissionSchema,
} from "@/lib/contracts/missions";
import { ModuleDetailSchema, ModuleParamsSchema } from "@/lib/contracts/modules";
import {
  CreateNoteResponseSchema,
  CreateNoteSchema,
  DeleteNoteQuerySchema,
  DeleteNoteResponseSchema,
  ListNotesResponseSchema,
} from "@/lib/contracts/notes";
import {
  CreateProjectResponseSchema,
  CreateProjectSchema,
  DeleteProjectQuerySchema,
  DeleteProjectResponseSchema,
  PortfolioResponseSchema,
  UpdatePortfolioSchema,
} from "@/lib/contracts/portfolio";
import { PlannerForecastRequestSchema, PlannerForecastSchema } from "@/lib/contracts/planner";
import { ProgressResponseSchema } from "@/lib/contracts/progress";
import { TrackProgressSchema } from "@/lib/contracts/track-progress";
import { QuizAttemptResultSchema, QuizSubmissionSchema } from "@/lib/contracts/quiz";
import { CatalogSchema, TrackDetailSchema } from "@/lib/contracts/catalog";
import { TrackParamsSchema, TracksQuerySchema } from "@/lib/contracts/tracks";

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
    path: "/api/v1/auth/register",
    tags: ["auth"],
    summary: "Create a credential account and return tokens",
    request: {
      body: { content: { "application/json": { schema: RegisterRequestSchema } } },
    },
    responses: {
      200: {
        description: "Token pair",
        content: { "application/json": { schema: TokenPairSchema } },
      },
      400: errorResponse("Validation error / email already in use"),
    },
  });

  const okJson = {
    description: "OK",
    content: { "application/json": { schema: OkResponseSchema } },
  };

  registry.registerPath({
    method: "post",
    path: "/api/v1/auth/request-password-reset",
    tags: ["auth"],
    summary: "Email a password-reset link if the account exists",
    request: { body: { content: { "application/json": { schema: RequestPasswordResetSchema } } } },
    responses: { 200: okJson },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/auth/reset-password",
    tags: ["auth"],
    summary: "Set a new password from a reset token",
    request: { body: { content: { "application/json": { schema: ResetPasswordSchema } } } },
    responses: { 200: okJson, 400: errorResponse("Invalid or expired token") },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/auth/verify-email",
    tags: ["auth"],
    summary: "Confirm an email from a verification token",
    request: { body: { content: { "application/json": { schema: VerifyEmailSchema } } } },
    responses: { 200: okJson, 400: errorResponse("Invalid or expired token") },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/auth/request-email-verification",
    tags: ["auth"],
    summary: "Resend the verification email for the current user",
    security: [{ [bearerAuth.name]: [] }],
    responses: { 200: okJson, 401: errorResponse("Authentication required") },
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
        content: { "application/json": { schema: CatalogSchema } },
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
    path: "/api/v1/tracks/{slug}/progress",
    tags: ["learning"],
    summary: "The caller's per-module progress in a track",
    security: [{ [bearerAuth.name]: [] }],
    request: { params: TrackParamsSchema, query: TracksQuerySchema },
    responses: {
      200: {
        description: "Track progress",
        content: { "application/json": { schema: TrackProgressSchema } },
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
    method: "post",
    path: "/api/v1/tracks/{slug}/modules/{moduleId}/missions/{missionId}/submissions",
    tags: ["learning"],
    summary: "Submit a mission artifact and receive an evaluation",
    security: [{ [bearerAuth.name]: [] }],
    request: {
      params: MissionParamsSchema,
      body: { content: { "application/json": { schema: MissionSubmissionSchema } } },
    },
    responses: {
      200: {
        description: "Mission evaluation",
        content: { "application/json": { schema: MissionSubmissionResultSchema } },
      },
      400: errorResponse("Invalid submission"),
      401: errorResponse("Authentication required"),
      403: errorResponse("Feature not available on plan / usage limit reached"),
      404: errorResponse("Mission not found"),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/planner/forecast",
    tags: ["planner"],
    summary: "Compute the workload forecast for a learning plan",
    security: [{ [bearerAuth.name]: [] }],
    request: { body: { content: { "application/json": { schema: PlannerForecastRequestSchema } } } },
    responses: {
      200: { description: "Forecast", content: { "application/json": { schema: PlannerForecastSchema } } },
      400: errorResponse("Validation error"),
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/me/quiz-attempts",
    tags: ["me"],
    summary: "The caller's recent quiz attempts and stats",
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      200: {
        description: "Progress",
        content: { "application/json": { schema: ProgressResponseSchema } },
      },
      401: errorResponse("Authentication required"),
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

  registry.registerPath({
    method: "get",
    path: "/api/v1/notes",
    tags: ["notes"],
    summary: "List the caller's notes",
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      200: { description: "Notes", content: { "application/json": { schema: ListNotesResponseSchema } } },
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/notes",
    tags: ["notes"],
    summary: "Create a note",
    security: [{ [bearerAuth.name]: [] }],
    request: { body: { content: { "application/json": { schema: CreateNoteSchema } } } },
    responses: {
      201: { description: "Created note", content: { "application/json": { schema: CreateNoteResponseSchema } } },
      400: errorResponse("Validation error"),
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/v1/notes",
    tags: ["notes"],
    summary: "Delete one of the caller's notes",
    security: [{ [bearerAuth.name]: [] }],
    request: { query: DeleteNoteQuerySchema },
    responses: {
      200: { description: "Deletion result", content: { "application/json": { schema: DeleteNoteResponseSchema } } },
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/portfolio",
    tags: ["portfolio"],
    summary: "The caller's portfolio with projects",
    security: [{ [bearerAuth.name]: [] }],
    responses: {
      200: { description: "Portfolio", content: { "application/json": { schema: PortfolioResponseSchema } } },
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "put",
    path: "/api/v1/portfolio",
    tags: ["portfolio"],
    summary: "Update portfolio metadata",
    security: [{ [bearerAuth.name]: [] }],
    request: { body: { content: { "application/json": { schema: UpdatePortfolioSchema } } } },
    responses: {
      200: { description: "Portfolio", content: { "application/json": { schema: PortfolioResponseSchema } } },
      400: errorResponse("Validation error"),
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/v1/portfolio/projects",
    tags: ["portfolio"],
    summary: "Add a portfolio project",
    security: [{ [bearerAuth.name]: [] }],
    request: { body: { content: { "application/json": { schema: CreateProjectSchema } } } },
    responses: {
      201: { description: "Created project", content: { "application/json": { schema: CreateProjectResponseSchema } } },
      400: errorResponse("Validation error"),
      401: errorResponse("Authentication required"),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/v1/portfolio/projects",
    tags: ["portfolio"],
    summary: "Delete a portfolio project",
    security: [{ [bearerAuth.name]: [] }],
    request: { query: DeleteProjectQuerySchema },
    responses: {
      200: { description: "Deletion result", content: { "application/json": { schema: DeleteProjectResponseSchema } } },
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
