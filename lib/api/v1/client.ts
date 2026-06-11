import type { z } from "zod";

import {
  LoginRequestSchema,
  MeResponseSchema,
  RefreshRequestSchema,
  TokenPairSchema,
  type LoginRequest,
  type MeResponse,
  type RefreshRequest,
  type TokenPairResponse,
} from "@/lib/contracts/auth";
import {
  CreateBookmarkResponseSchema,
  CreateBookmarkSchema,
  DeleteBookmarkResponseSchema,
  ListBookmarksResponseSchema,
  type Bookmark,
  type CreateBookmarkInput,
} from "@/lib/contracts/bookmarks";
import {
  ModuleDetailSchema,
  type ModuleDetailResponse,
} from "@/lib/contracts/modules";
import {
  CreateNoteResponseSchema,
  CreateNoteSchema,
  DeleteNoteResponseSchema,
  ListNotesResponseSchema,
  type CreateNoteInput,
  type Note,
} from "@/lib/contracts/notes";
import {
  CreateProjectResponseSchema,
  CreateProjectSchema,
  DeleteProjectResponseSchema,
  PortfolioResponseSchema,
  UpdatePortfolioSchema,
  type CreateProjectInput,
  type Portfolio,
  type PortfolioProject,
  type UpdatePortfolioInput,
} from "@/lib/contracts/portfolio";
import {
  JobsMatchResponseSchema,
  type JobsMatchResponse,
} from "@/lib/contracts/jobs";
import {
  MissionSubmissionResultSchema,
  MissionSubmissionSchema,
  type MissionSubmission,
  type MissionSubmissionResult,
} from "@/lib/contracts/missions";
import {
  PlannerForecastRequestSchema,
  PlannerForecastSchema,
  type PlannerForecast,
  type PlannerForecastRequest,
} from "@/lib/contracts/planner";
import {
  ProgressResponseSchema,
  type ProgressResponse,
} from "@/lib/contracts/progress";
import {
  OkResponseSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  type OkResponse,
  type RequestPasswordReset,
  type ResetPassword,
  type VerifyEmail,
} from "@/lib/contracts/account";
import {
  RegisterRequestSchema,
  type RegisterRequest,
} from "@/lib/contracts/register";
import {
  TrackProgressSchema,
  type TrackProgressResponse,
} from "@/lib/contracts/track-progress";
import {
  QuizAttemptResultSchema,
  QuizSubmissionSchema,
  type QuizAttemptResultResponse,
  type QuizSubmission,
} from "@/lib/contracts/quiz";
import {
  CatalogSchema,
  TrackDetailSchema,
  type CatalogResponse,
  type LearnerCourse,
} from "@/lib/contracts/catalog";
import { type TracksQuery } from "@/lib/contracts/tracks";

/**
 * Typed client SDK for the `/api/v1` API.
 *
 * Built directly from the Zod contracts, so request/response types stay in sync
 * with the server with zero codegen. Runs anywhere `fetch` exists — browser,
 * Node, and React Native — making it the shared SDK for the web and Expo clients.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type TokenGetter = () => string | null | undefined | Promise<string | null | undefined>;

export type ApiClientOptions = {
  /** API origin, e.g. https://app.levio.com. Defaults to same-origin ("" ). */
  baseUrl?: string;
  /** Supplies the current access token for authenticated calls. */
  getAccessToken?: TokenGetter;
  /** Override fetch (tests, custom agents). Defaults to the global fetch. */
  fetch?: typeof fetch;
};

type RequestInitLite<S extends z.ZodTypeAny> = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  schema: S;
  query?: Record<string, unknown>;
  body?: unknown;
  auth?: boolean;
};

function toQueryString(query?: Record<string, unknown>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
  const doFetch = options.fetch ?? globalThis.fetch;

  async function request<S extends z.ZodTypeAny>(init: RequestInitLite<S>): Promise<z.infer<S>> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (init.body !== undefined) headers["Content-Type"] = "application/json";

    if (init.auth && options.getAccessToken) {
      const token = await options.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await doFetch(`${baseUrl}${init.path}${toQueryString(init.query)}`, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const err = (payload ?? {}) as { code?: string; message?: string };
      throw new ApiError(response.status, err.code ?? "UNKNOWN_ERROR", err.message ?? response.statusText);
    }

    return init.schema.parse(payload);
  }

  return {
    auth: {
      register(body: RegisterRequest): Promise<TokenPairResponse> {
        return request({
          method: "POST",
          path: "/api/v1/auth/register",
          body: RegisterRequestSchema.parse(body),
          schema: TokenPairSchema,
        });
      },
      login(body: LoginRequest): Promise<TokenPairResponse> {
        return request({
          method: "POST",
          path: "/api/v1/auth/login",
          body: LoginRequestSchema.parse(body),
          schema: TokenPairSchema,
        });
      },
      refresh(body: RefreshRequest): Promise<TokenPairResponse> {
        return request({
          method: "POST",
          path: "/api/v1/auth/refresh",
          body: RefreshRequestSchema.parse(body),
          schema: TokenPairSchema,
        });
      },
      me(): Promise<MeResponse> {
        return request({ method: "GET", path: "/api/v1/auth/me", schema: MeResponseSchema, auth: true });
      },
      requestPasswordReset(body: RequestPasswordReset): Promise<OkResponse> {
        return request({
          method: "POST",
          path: "/api/v1/auth/request-password-reset",
          body: RequestPasswordResetSchema.parse(body),
          schema: OkResponseSchema,
        });
      },
      resetPassword(body: ResetPassword): Promise<OkResponse> {
        return request({
          method: "POST",
          path: "/api/v1/auth/reset-password",
          body: ResetPasswordSchema.parse(body),
          schema: OkResponseSchema,
        });
      },
      verifyEmail(body: VerifyEmail): Promise<OkResponse> {
        return request({
          method: "POST",
          path: "/api/v1/auth/verify-email",
          body: VerifyEmailSchema.parse(body),
          schema: OkResponseSchema,
        });
      },
      requestEmailVerification(): Promise<OkResponse> {
        return request({
          method: "POST",
          path: "/api/v1/auth/request-email-verification",
          schema: OkResponseSchema,
          auth: true,
        });
      },
    },
    jobs: {
      match(query?: { track?: "QA" | "BA" | "DA"; skills?: string[] }): Promise<JobsMatchResponse> {
        const params = new URLSearchParams();
        if (query?.track) params.set("track", query.track);
        for (const skill of query?.skills ?? []) params.append("skill", skill);
        const qs = params.toString();
        return request({
          method: "GET",
          path: `/api/v1/jobs/match${qs ? `?${qs}` : ""}`,
          schema: JobsMatchResponseSchema,
          auth: true,
        });
      },
    },
    planner: {
      forecast(plan: PlannerForecastRequest["plan"]): Promise<PlannerForecast> {
        return request({
          method: "POST",
          path: "/api/v1/planner/forecast",
          body: PlannerForecastRequestSchema.parse({ plan }),
          schema: PlannerForecastSchema,
          auth: true,
        });
      },
    },
    me: {
      progress(): Promise<ProgressResponse> {
        return request({
          method: "GET",
          path: "/api/v1/me/quiz-attempts",
          schema: ProgressResponseSchema,
          auth: true,
        });
      },
    },
    tracks: {
      list(query?: Partial<TracksQuery>): Promise<CatalogResponse> {
        return request({
          method: "GET",
          path: "/api/v1/tracks",
          query: query as Record<string, unknown> | undefined,
          schema: CatalogSchema,
          auth: true,
        });
      },
      async get(slug: string): Promise<LearnerCourse> {
        const { course } = await request({
          method: "GET",
          path: `/api/v1/tracks/${encodeURIComponent(slug)}`,
          schema: TrackDetailSchema,
          auth: true,
        });
        return course;
      },
      progress(slug: string): Promise<TrackProgressResponse> {
        return request({
          method: "GET",
          path: `/api/v1/tracks/${encodeURIComponent(slug)}/progress`,
          schema: TrackProgressSchema,
          auth: true,
        });
      },
      getModule(slug: string, moduleId: string): Promise<ModuleDetailResponse> {
        return request({
          method: "GET",
          path: `/api/v1/tracks/${encodeURIComponent(slug)}/modules/${encodeURIComponent(moduleId)}`,
          schema: ModuleDetailSchema,
          auth: true,
        });
      },
      submitQuiz(
        slug: string,
        moduleId: string,
        submission: QuizSubmission,
      ): Promise<QuizAttemptResultResponse> {
        return request({
          method: "POST",
          path: `/api/v1/tracks/${encodeURIComponent(slug)}/modules/${encodeURIComponent(moduleId)}/quiz/attempts`,
          body: QuizSubmissionSchema.parse(submission),
          schema: QuizAttemptResultSchema,
          auth: true,
        });
      },
      submitMission(
        slug: string,
        moduleId: string,
        missionId: string,
        submission: MissionSubmission,
      ): Promise<MissionSubmissionResult> {
        return request({
          method: "POST",
          path: `/api/v1/tracks/${encodeURIComponent(slug)}/modules/${encodeURIComponent(moduleId)}/missions/${encodeURIComponent(missionId)}/submissions`,
          body: MissionSubmissionSchema.parse(submission),
          schema: MissionSubmissionResultSchema,
          auth: true,
        });
      },
    },
    bookmarks: {
      async list(): Promise<Bookmark[]> {
        const { bookmarks } = await request({
          method: "GET",
          path: "/api/v1/bookmarks",
          schema: ListBookmarksResponseSchema,
          auth: true,
        });
        return bookmarks;
      },
      async create(input: CreateBookmarkInput): Promise<Bookmark> {
        const { bookmark } = await request({
          method: "POST",
          path: "/api/v1/bookmarks",
          body: CreateBookmarkSchema.parse(input),
          schema: CreateBookmarkResponseSchema,
          auth: true,
        });
        return bookmark;
      },
      remove(id: string): Promise<{ ok: boolean }> {
        return request({
          method: "DELETE",
          path: "/api/v1/bookmarks",
          query: { id },
          schema: DeleteBookmarkResponseSchema,
          auth: true,
        });
      },
    },
    notes: {
      async list(): Promise<Note[]> {
        const { notes } = await request({
          method: "GET",
          path: "/api/v1/notes",
          schema: ListNotesResponseSchema,
          auth: true,
        });
        return notes;
      },
      async create(input: CreateNoteInput): Promise<Note> {
        const { note } = await request({
          method: "POST",
          path: "/api/v1/notes",
          body: CreateNoteSchema.parse(input),
          schema: CreateNoteResponseSchema,
          auth: true,
        });
        return note;
      },
      remove(id: string): Promise<{ ok: boolean }> {
        return request({
          method: "DELETE",
          path: "/api/v1/notes",
          query: { id },
          schema: DeleteNoteResponseSchema,
          auth: true,
        });
      },
    },
    portfolio: {
      async get(): Promise<Portfolio> {
        const { portfolio } = await request({
          method: "GET",
          path: "/api/v1/portfolio",
          schema: PortfolioResponseSchema,
          auth: true,
        });
        return portfolio;
      },
      async update(input: UpdatePortfolioInput): Promise<Portfolio> {
        const { portfolio } = await request({
          method: "PUT",
          path: "/api/v1/portfolio",
          body: UpdatePortfolioSchema.parse(input),
          schema: PortfolioResponseSchema,
          auth: true,
        });
        return portfolio;
      },
      async addProject(input: CreateProjectInput): Promise<PortfolioProject> {
        const { project } = await request({
          method: "POST",
          path: "/api/v1/portfolio/projects",
          body: CreateProjectSchema.parse(input),
          schema: CreateProjectResponseSchema,
          auth: true,
        });
        return project;
      },
      removeProject(id: string): Promise<{ ok: boolean }> {
        return request({
          method: "DELETE",
          path: "/api/v1/portfolio/projects",
          query: { id },
          schema: DeleteProjectResponseSchema,
          auth: true,
        });
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
