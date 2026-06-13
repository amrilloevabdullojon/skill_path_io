import { NextResponse } from "next/server";

import { withErrorHandler } from "@/lib/api/error-handler";
import { buildOpenApiDocument } from "@/lib/api/v1/openapi";

export const runtime = "nodejs";

/**
 * GET /api/v1/openapi.json — machine-readable OpenAPI 3.0 spec for the API.
 * Public so tooling and client generators can fetch it without a token.
 */
export const GET = withErrorHandler(async () => {
  return NextResponse.json(buildOpenApiDocument());
});
