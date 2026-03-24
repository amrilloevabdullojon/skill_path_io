import { NextResponse } from "next/server";

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "FEATURE_GATED"
  | "AI_UNAVAILABLE"
  | "DB_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  validation: (message: string) => new AppError("VALIDATION_ERROR", message, 400),
  unauthorized: (message = "Authentication required") => new AppError("UNAUTHORIZED", message, 401),
  forbidden: (message = "Access denied") => new AppError("FORBIDDEN", message, 403),
  notFound: (message: string) => new AppError("NOT_FOUND", message, 404),
  rateLimited: (message = "Too many requests") => new AppError("RATE_LIMITED", message, 429),
  featureGated: (message = "Upgrade required") => new AppError("FEATURE_GATED", message, 403),
  aiUnavailable: (message = "AI service unavailable") => new AppError("AI_UNAVAILABLE", message, 502),
  db: (message = "Database error") => new AppError("DB_ERROR", message, 500),
  internal: (message = "Internal server error") => new AppError("INTERNAL_ERROR", message, 500),
};

type ErrorResponseBody = {
  error: string;
  code: AppErrorCode | "UNKNOWN_ERROR";
  message: string;
};

function toErrorResponse(err: unknown): { body: ErrorResponseBody; status: number } {
  if (err instanceof AppError) {
    return {
      body: { error: err.code, code: err.code, message: err.message },
      status: err.status,
    };
  }

  const message = err instanceof Error ? err.message : "An unexpected error occurred";
  return {
    body: { error: "UNKNOWN_ERROR", code: "UNKNOWN_ERROR", message },
    status: 500,
  };
}

/**
 * Wrap an API route handler with unified error handling.
 *
 * Usage:
 *   export const POST = withErrorHandler(async (req) => { ... })
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      const { body, status } = toErrorResponse(err);
      if (process.env.NODE_ENV !== "production") {
        console.error("[API Error]", body.code, body.message, err);
      }
      return NextResponse.json(body, { status });
    }
  };
}

/** Shorthand helpers for common responses */
export const apiOk = <T>(data: T, status = 200) => NextResponse.json(data, { status });

export const apiError = (
  code: AppErrorCode | "UNKNOWN_ERROR",
  message: string,
  status: number
) => NextResponse.json({ error: code, code, message }, { status });
