import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, parseQuery, respond } from "@/lib/api/v1/http";
import {
  CreateProjectResponseSchema,
  CreateProjectSchema,
  DeleteProjectQuerySchema,
  DeleteProjectResponseSchema,
} from "@/lib/contracts/portfolio";
import { addProject, deleteProject } from "@/lib/portfolio/service";

export const runtime = "nodejs";

/** POST /api/v1/portfolio/projects — add a project to the caller's portfolio. */
export const POST = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const input = await parseBody(request, CreateProjectSchema);
  const project = await addProject(userId, input);
  return respond(CreateProjectResponseSchema, { project }, 201);
});

/** DELETE /api/v1/portfolio/projects?id=... — remove one of the caller's projects. */
export const DELETE = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const { id } = parseQuery(request, DeleteProjectQuerySchema);
  await deleteProject(userId, id);
  return respond(DeleteProjectResponseSchema, { ok: true });
});
