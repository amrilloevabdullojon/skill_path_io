import { NextResponse } from "next/server";

import { MentorContext, MentorMessage } from "@/types/ai";
import { getServerEnv } from "@/lib/config/env";
import { applyRateLimit } from "@/lib/server/rate-limit";

function toSafeString(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

function buildMentorSystemPrompt(trackTitle: string, moduleTitle: string, lessonText: string) {
  return [
    `You are an experienced mentor of SkillPath Academy. The student is studying module '${moduleTitle}' in track '${trackTitle}'. Reply in Russian language. Explain simply with examples. Share practical advice from real experience. Use emoji for clarity.`,
    "Lesson context (up to 2000 chars):",
    lessonText || "Lesson context is missing.",
  ].join("\n\n");
}

export async function handleMentorRequest(request: Request, body: { context?: MentorContext; messages?: MentorMessage[] }) {
  let env;
  try {
    env = getServerEnv();
  } catch (error) {
    return NextResponse.json(
      {
        error: "Environment validation failed.",
        details: error instanceof Error ? error.message : "Unknown environment error",
      },
      { status: 500 },
    );
  }

  const ip = getClientIp(request);
  const rateLimit = applyRateLimit({
    key: `mentor:${ip}`,
    maxRequests: env.mentorRateLimitMaxRequests,
    windowMs: env.mentorRateLimitWindowMs,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please retry later." },
      {
        status: 429,
        headers: {
          "cache-control": "no-store",
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
          "retry-after": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return NextResponse.json(
      { error: "AI service is not configured." },
      {
        status: 500,
        headers: {
          "cache-control": "no-store",
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter(
      (message): message is MentorMessage =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        Boolean(message.content.trim()),
    )
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim() }],
    }));

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "No messages provided." },
      {
        status: 400,
        headers: {
          "cache-control": "no-store",
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  const trackTitle = toSafeString(body.context?.trackTitle, "Unknown track");
  const moduleTitle = toSafeString(body.context?.moduleTitle, "Unknown module");
  const lessonText = toSafeString(body.context?.lessonText, "").slice(0, 2000);
  const systemPrompt = buildMentorSystemPrompt(trackTitle, moduleTitle, lessonText);

  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Mentor request failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 502,
        headers: {
          "cache-control": "no-store",
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    return NextResponse.json(
      {
        error: "AI request failed.",
        details: errorText.slice(0, 1000),
      },
      {
        status: geminiResponse.status,
        headers: {
          "cache-control": "no-store",
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  const result = (await geminiResponse.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const reply = result.candidates?.[0]?.content?.parts
    ?.map((p) => p.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n") ?? "";

  return NextResponse.json(
    { reply: reply || "Could not get a mentor answer. Try rephrasing your question." },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "x-ratelimit-limit": String(rateLimit.limit),
        "x-ratelimit-remaining": String(rateLimit.remaining),
        "x-ratelimit-reset": String(rateLimit.resetAt),
      },
    },
  );
}
