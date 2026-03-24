import { NextResponse } from "next/server";

import { reviewUserStoryLocally } from "@/features/simulations/ba-simulation";

type Body = {
  actor?: string;
  action?: string;
  value?: string;
  acceptanceCriteria?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (
    typeof body.actor !== "string" ||
    typeof body.action !== "string" ||
    typeof body.value !== "string" ||
    typeof body.acceptanceCriteria !== "string"
  ) {
    return NextResponse.json(
      {
        error: "Invalid user story payload.",
      },
      { status: 400 },
    );
  }

  const review = reviewUserStoryLocally({
    actor: body.actor,
    action: body.action,
    value: body.value,
    acceptanceCriteria: body.acceptanceCriteria,
  });

  return NextResponse.json(review, { status: 200 });
}
