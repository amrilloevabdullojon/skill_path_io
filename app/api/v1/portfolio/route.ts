import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { PortfolioResponseSchema, UpdatePortfolioSchema } from "@/lib/contracts/portfolio";
import { getOrCreatePortfolio, updatePortfolio } from "@/lib/portfolio/service";

export const runtime = "nodejs";

/** GET /api/v1/portfolio — the caller's portfolio with projects. */
export const GET = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const portfolio = await getOrCreatePortfolio(userId);
  return respond(PortfolioResponseSchema, { portfolio });
});

/** PUT /api/v1/portfolio — update portfolio metadata. */
export const PUT = withErrorHandler(async (request: Request) => {
  const { id: userId } = await requireIdentity(request);
  const input = await parseBody(request, UpdatePortfolioSchema);
  const portfolio = await updatePortfolio(userId, input);
  return respond(PortfolioResponseSchema, { portfolio });
});
