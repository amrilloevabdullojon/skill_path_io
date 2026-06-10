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
import { TracksCatalogSchema, TracksQuerySchema } from "@/lib/contracts/tracks";

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
