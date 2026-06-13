import { getServerSession } from "next-auth";

import { callAnthropic, checkRateLimit } from "@/lib/ai/ai-service";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { authOptions } from "@/lib/auth";
import { readAdminSettings } from "@/lib/admin-settings";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import { prisma } from "@/lib/prisma";
import type { AppRoleEnum } from "@/types/next-auth";

const TRACKS = ["QA", "BA", "DA"] as const;
type Track = (typeof TRACKS)[number];

const QUESTIONS: Record<Track, string> = {
  QA: "Что такое регрессионное тестирование и когда его необходимо проводить?",
  BA: "В чем разница между функциональными и нефункциональными требованиями?",
  DA: "Что такое нормализация баз данных и зачем она нужна?",
};

const ALLOWED_ROLES: AppRoleEnum[] = ["PRO_STUDENT", "MENTOR", "RECRUITER", "ADMIN"];

const MAX_ANSWER_LEN = 4000;
const MIN_ANSWER_LEN = 10;

export const POST = withErrorHandler(async (request: Request) => {
  const settings = readAdminSettings();

  if (!settings.aiEnabled) {
    throw Errors.aiUnavailable("AI features are temporarily disabled for maintenance.");
  }

  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as AppRoleEnum | undefined;
  if (!session?.user?.id || !userRole || !ALLOWED_ROLES.includes(userRole)) {
    throw Errors.forbidden("This endpoint requires a PRO subscription.");
  }

  const rateLimit = checkRateLimit({
    request,
    bucket: `ai-interview:${session.user.id}`,
    maxRequests: settings.aiRateLimit,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    throw Errors.rateLimited();
  }

  const body = (await request.json()) as { answer?: unknown; track?: unknown };

  if (typeof body.answer !== "string") {
    throw Errors.validation("Answer is required.");
  }
  const answer = body.answer.trim();
  if (answer.length < MIN_ANSWER_LEN) {
    throw Errors.validation("Answer too short.");
  }
  if (answer.length > MAX_ANSWER_LEN) {
    throw Errors.validation(`Answer must be at most ${MAX_ANSWER_LEN} characters.`);
  }

  if (typeof body.track !== "string" || !(TRACKS as readonly string[]).includes(body.track)) {
    throw Errors.validation("Invalid track. Allowed: QA, BA, DA.");
  }
  const track = body.track as Track;
  const question = QUESTIONS[track];

  const systemPrompt = `
      You are an expert ${track} Technical Interviewer.
      You asked the candidate the following question: "${question}"

      The candidate answered: "${answer}"

      Evaluate their answer in Russian language. Be encouraging but professional.

      Return EXACTLY a JSON object with this shape, and NO markdown wrappers:
      {
        "score": number (0 to 10),
        "feedback": "A short 2-3 sentence paragraph explaining why they got this score",
        "missing": "One critical thing they failed to mention (if any, otherwise empty string)"
      }
    `;

  const result = await callAnthropic({
    systemPrompt,
    messages: [{ role: "user", content: "Please evaluate the answer." }],
    temperature: 0.2,
    maxTokens: 2048,
  });

  if (!result.ok) {
    // In development, return mock data when no key is configured so the UI
    // stays demoable. In production, surface the real service error.
    if (
      isDemoModeEnabled() &&
      result.error &&
      result.error.includes("not configured")
    ) {
      return apiOk(
        {
          score: 7,
          feedback: "Хороший ответ, но можно добавить больше технических деталей.",
          missing:
            "Не упомянуто влияние на производительность (Mock Data, API Key not configured)",
        },
        200,
      );
    }
    throw Errors.aiUnavailable(result.error || "AI service error");
  }

  let parsed: { score: number; feedback: string; missing: string };
  try {
    let raw = result.data.trim();
    raw = raw.replace(/^```[a-z]*\s*/i, "").replace(/```$/i, "").trim();

    const firstBrace = raw.indexOf("{");
    let lastBrace = raw.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace === -1) {
      raw += '"}';
      lastBrace = raw.lastIndexOf("}");
    }

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.substring(firstBrace, lastBrace + 1);
    }

    const json = JSON.parse(raw) as Record<string, unknown>;
    const score = typeof json.score === "number" ? json.score : Number(json.score);
    if (!Number.isFinite(score)) throw new Error("score must be a number");
    parsed = {
      score: Math.max(0, Math.min(10, score)),
      feedback: typeof json.feedback === "string" ? json.feedback : "",
      missing: typeof json.missing === "string" ? json.missing : "",
    };
  } catch (e) {
    const detail = e instanceof Error ? e.message : "unknown";
    console.error("AI JSON Parse Error. Raw response:", result.data);
    throw Errors.aiUnavailable(`Failed to parse AI JSON. ${detail}`);
  }

  // Await the usage log so rate-limit / billing metrics stay accurate.
  // Swallow the error so a logging failure doesn't break the user response.
  try {
    await prisma.aiUsageLog.create({
      data: { feature: "AI_INTERVIEW", userId: session.user.id },
    });
  } catch (err) {
    console.error("AiUsageLog failed:", err);
  }

  return apiOk(parsed, 200);
});
