import { getServerSession } from "next-auth";

import { Errors, apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { authOptions } from "@/lib/auth";
import { reviewUserStoryLocally } from "@/features/simulations/ba-simulation";

type Body = {
  actor?: string;
  action?: string;
  value?: string;
  acceptanceCriteria?: string;
};

export const POST = withErrorHandler(async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw Errors.unauthorized();
  }

  const body = (await request.json()) as Body;

  if (
    typeof body.actor !== "string" ||
    typeof body.action !== "string" ||
    typeof body.value !== "string" ||
    typeof body.acceptanceCriteria !== "string"
  ) {
    throw Errors.validation("Invalid user story payload.");
  }

  const review = reviewUserStoryLocally({
    actor: body.actor,
    action: body.action,
    value: body.value,
    acceptanceCriteria: body.acceptanceCriteria,
  });

  return apiOk(review);
});
