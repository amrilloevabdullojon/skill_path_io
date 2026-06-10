import { NextResponse } from "next/server";
import { z } from "zod";

import { apiOk, Errors } from "@/lib/api/error-handler";

/**
 * Shared HTTP helpers for the versioned `/api/v1/*` API.
 *
 * Design goals:
 * - Zod schemas are the single source of truth for request/response shapes.
 * - Validation failures map onto the existing AppError contract (`Errors.validation`)
 *   so every endpoint returns the same error envelope.
 * - Response schemas are enforced in non-production to catch contract drift early,
 *   and skipped in production to avoid per-request overhead.
 */

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
}

/** Coerce a query-string value into a boolean with a default. Accepts 1/0/true/false/yes/no. */
export function booleanParam(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["1", "true", "yes", "on"].includes(normalized)) return true;
      if (["0", "false", "no", "off"].includes(normalized)) return false;
    }
    return value;
  }, z.boolean());
}

/** Parse and validate URL query params against a schema. Throws `VALIDATION_ERROR` on failure. */
export function parseQuery<S extends z.ZodTypeAny>(request: Request, schema: S): z.infer<S> {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const result = schema.safeParse(params);
  if (!result.success) {
    throw Errors.validation(formatZodError(result.error));
  }
  return result.data;
}

/** Parse and validate a JSON request body against a schema. Throws `VALIDATION_ERROR` on failure. */
export async function parseBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<z.infer<S>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw Errors.validation("Request body must be valid JSON");
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw Errors.validation(formatZodError(result.error));
  }
  return result.data;
}

/**
 * Serialize a successful response, validating it against the contract schema
 * outside production so drift between the service layer and the published
 * contract fails loudly in dev and tests.
 */
export function respond<S extends z.ZodTypeAny>(
  schema: S,
  data: z.infer<S>,
  status = 200,
): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`/api/v1 response contract violation: ${formatZodError(result.error)}`);
    }
    return apiOk(result.data, status);
  }
  return apiOk(data, status);
}
