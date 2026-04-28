import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { callAnthropic, checkRateLimit } from "@/lib/ai/ai-service";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { LearningMission } from "@/types/personalization";

type ChatMsg = { role: "ai" | "user"; text: string };

function isChatMsg(v: unknown): v is ChatMsg {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return (
    (m.role === "ai" || m.role === "user") &&
    typeof m.text === "string" &&
    m.text.length > 0 &&
    m.text.length <= 4000
  );
}

function isMission(v: unknown): v is LearningMission {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.roleContext === "string" &&
    typeof m.scenario === "string" &&
    typeof m.objective === "string"
  );
}

export const POST = withErrorHandler(async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw Errors.unauthorized();
  }

  const rateLimit = checkRateLimit({ request, bucket: `mission-chat:${session.user.email}` });
  if (!rateLimit.allowed) {
    throw Errors.rateLimited();
  }

  const body = (await request.json()) as { mission?: unknown; history?: unknown };

  if (!isMission(body.mission)) {
    throw Errors.validation("Mission details are required.");
  }
  if (!Array.isArray(body.history) || body.history.length === 0 || body.history.length > 40) {
    throw Errors.validation("Chat history must contain 1–40 messages.");
  }
  if (!body.history.every(isChatMsg)) {
    throw Errors.validation("Chat history contains invalid entries.");
  }

  const mission = body.mission;
  const history = body.history as ChatMsg[];

  const systemPrompt = `
You are participating in a corporate roleplay simulation on Levio.
Your role: ${mission.roleContext}.
The scenario is: "${mission.scenario}".
The user's overall goal is to: "${mission.objective}".

Instructions:
- Keep your responses extremely concise (1-3 sentences maximum).
- Act entirely IN CHARACTER. Do not mention that you are an AI.
- Speak in Russian.
- React realistically to what the user says. Use corporate jargon if appropriate.
- Push back if the user asks for things without providing context, just like a real stakeholder would.
- If the user provides a good solution, acknowledge it positively, but maybe ask one clarifying question.
  `.trim();

  const mappedMessages = history.map((msg) => ({
    role: msg.role === "ai" ? ("assistant" as const) : ("user" as const),
    content: msg.text,
  }));

  const aiResult = await callAnthropic({
    systemPrompt,
    messages: mappedMessages,
    temperature: 0.6,
    maxTokens: 500,
  });

  if (!aiResult.ok) {
    throw Errors.aiUnavailable(aiResult.error || "AI service error");
  }

  return apiOk({ text: aiResult.data }, 200);
});
