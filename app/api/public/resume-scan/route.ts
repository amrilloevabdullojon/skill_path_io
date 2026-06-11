import { getServerSession } from "next-auth";

import { callAnthropic, checkRateLimit } from "@/lib/ai/ai-service";
import { apiOk, Errors, withErrorHandler } from "@/lib/api/error-handler";
import { authOptions } from "@/lib/auth";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import { prisma } from "@/lib/prisma";
import { readAdminSettings } from "@/lib/admin-settings";

const MIN_RESUME_LEN = 10;
const MAX_RESUME_LEN = 20_000;

export const POST = withErrorHandler(async (request: Request) => {
  const settings = readAdminSettings();

  if (!settings.aiEnabled) {
    throw Errors.aiUnavailable("AI features are temporarily disabled for maintenance.");
  }

  // Public endpoint: allow anonymous use but rate-limit by IP when no session,
  // otherwise by userId to prevent a single user from burning the IP bucket.
  const session = await getServerSession(authOptions);
  const bucketKey = session?.user?.id ? `resume-scan:user:${session.user.id}` : "public-resume-scan";

  const rateLimit = await checkRateLimit({
    request,
    bucket: bucketKey,
    maxRequests: settings.aiRateLimit,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    throw Errors.rateLimited();
  }

  const body = (await request.json()) as { resumeText?: unknown };

  if (typeof body.resumeText !== "string") {
    throw Errors.validation("Резюме обязательно.");
  }
  const resumeText = body.resumeText.trim();
  if (resumeText.length < MIN_RESUME_LEN) {
    throw Errors.validation("Текст слишком короткий. Напишите хотя бы пару предложений.");
  }
  if (resumeText.length > MAX_RESUME_LEN) {
    throw Errors.validation(`Резюме слишком длинное (макс. ${MAX_RESUME_LEN} символов).`);
  }

  const systemPrompt = `
      You are an absolutely ruthless and extremely precise corporate ATS (Applicant Tracking System) logic core, combined with a highly critical Senior IT Recruiter from 2026.

      The user provides their CV text.
      Your goal is to evaluate it brutally and fairly. Scan for keywords, roles, and missing vital modern infrastructure tools (CI/CD, Docker, Cloud, testing frameworks, analytics, etc) depending on their implied role.

      Respond EXACTLY and ONLY with a JSON object, absolutely zero markdown formatting (do not wrap in \`\`\`json).
      You must use Russian language for all text fields.

      Shape:
      {
        "atsScore": number (0 to 100),
        "marketValue": number (estimated current monthly salary in thousands of RUB, e.g. 130),
        "potentialValue": number (estimated potential salary in thousands of RUB if they fix their gaps with our Academy, e.g. 210),
        "missingSkills": string[] (array of 3-4 short highly specific missed technical skills like "Docker/Linux", "Jenkins CI/CD"),
        "roast": "string (A sharp, 2-3 sentence roast. Tell them exactly why they will be instantly rejected at the screening phase and how missing the skills is detrimental)",
        "keywords": string[] (array of existing 5-10 strong keywords found in their text that you actually liked)
      }
    `;

  const result = await callAnthropic({
    systemPrompt,
    messages: [{ role: "user", content: resumeText }],
    temperature: 0.1,
    maxTokens: 2048,
  });

  if (!result.ok) {
    // In development, fall back to a mock payload when keys are missing so the
    // demo UI keeps working. In production, surface the real error.
    if (
      isDemoModeEnabled() &&
      result.error &&
      result.error.includes("not configured")
    ) {
      return apiOk(
        {
          atsScore: 42,
          marketValue: 130,
          potentialValue: 210,
          missingSkills: ["CI/CD (GitLab, Jenkins)", "Docker / Linux", "Мобилки (Appium)"],
          roast:
            "Вы указали внедрение автотестов, но работодатели ищут связку с пайплайнами (CI/CD). Без Docker и Linux вас не пропустят на Senior-уровень (API Key is missing).",
          keywords: ["Postman", "JMeter", "Selenium", "SQL", "Python", "API", "Автотест", "Регресс"],
        },
        200,
      );
    }
    throw Errors.aiUnavailable(result.error || "AI service error");
  }

  let parsed: Record<string, unknown>;
  try {
    let raw = result.data.trim();
    raw = raw.replace(/^```[a-z]*\s*/i, "").replace(/```$/i, "").trim();

    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.substring(firstBrace, lastBrace + 1);
    }

    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (e) {
    const detail = e instanceof Error ? e.message : "unknown";
    console.error("AI JSON Parse Error:", detail);
    throw Errors.aiUnavailable(`Failed to parse AI JSON. ${detail}`);
  }

  const finalPayload = {
    atsScore: Number(parsed.atsScore) || 40,
    marketValue: Number(parsed.marketValue) || 120,
    potentialValue: Number(parsed.potentialValue) || 180,
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : ["CI/CD", "Docker"],
    roast: typeof parsed.roast === "string" ? parsed.roast : "Слабое резюме.",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
  };

  // Await the log so usage metrics don't race with the response.
  try {
    await prisma.aiUsageLog.create({
      data: { feature: "RESUME_SCAN", userId: session?.user?.id ?? null },
    });
  } catch (err) {
    console.error("AiUsageLog failed:", err);
  }

  return apiOk(finalPayload, 200);
});
