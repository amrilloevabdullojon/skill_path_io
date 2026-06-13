import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { callAnthropic, checkRateLimit } from "@/lib/ai/ai-service";
import { logAiUsage } from "@/lib/ai/usage-log";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import {
  denyFeature,
  denyUsage,
  ensureFeature,
  ensureUsage,
  recordMeterUsage,
  resolveApiSubscriptionContext,
} from "@/lib/saas/api-access";
import { LearningMission } from "@/types/personalization";

type ChatMsg = { role: "ai" | "user"; text: string };

function buildFallbackReply(mission: LearningMission, latestUserMessage: string) {
  const lowerMessage = latestUserMessage.toLowerCase();

  if (lowerMessage.includes("шаг") || lowerMessage.includes("воспроиз")) {
    return "Шаги пока плавают: пользователь открывает форму, меняет данные и после сохранения видит старое значение. Мне нужен от вас короткий план проверки.";
  }
  if (lowerMessage.includes("риск") || lowerMessage.includes("крит")) {
    return "Главный риск в том, что команда починит симптом, но не подтвердит источник проблемы. Зафиксируйте критерий, по которому мы поймём, что инцидент закрыт.";
  }
  if (lowerMessage.includes("требован") || lowerMessage.includes("критер")) {
    return "Минимальный критерий такой: результат должен быть проверяемым, с понятным владельцем и ожидаемым поведением. Запишите это без лишней теории.";
  }

  return `Я всё ещё в роли: ${mission.roleContext}. Мне нужен конкретный следующий вопрос или ваш черновик решения, чтобы я мог отреагировать по сценарию.`;
}

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

  const accessContext = await resolveApiSubscriptionContext();
  const featureGate = ensureFeature(accessContext, "ai.mentor");
  if (!featureGate.allowed) {
    return denyFeature("ai.mentor", featureGate.upgradePlanId);
  }
  const usageGate = ensureUsage(accessContext, "aiMentorRequests");
  if (usageGate.reached) {
    return denyUsage("aiMentorRequests", usageGate);
  }

  const rateLimit = await checkRateLimit({ request, bucket: `mission-chat:${session.user.email}` });
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
    const latestUserMessage = [...history].reverse().find((msg) => msg.role === "user")?.text ?? "";
    return apiOk({
      text: buildFallbackReply(mission, latestUserMessage),
      fallback: true,
    }, 200);
  }

  recordMeterUsage(accessContext, "aiMentorRequests");
  await logAiUsage("MISSION_CHAT", accessContext.userId);
  return apiOk({ text: aiResult.data }, 200);
});
