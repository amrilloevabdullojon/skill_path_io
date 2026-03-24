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

  if (!env.anthropicApiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
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
    .map((message) => ({ role: message.role, content: message.content.trim() }));

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

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.anthropicModel,
        system: systemPrompt,
        max_tokens: env.anthropicMaxTokens,
        temperature: 0.5,
        messages,
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

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    return NextResponse.json(
      {
        error: "Anthropic request failed.",
        details: errorText.slice(0, 1000),
      },
      {
        status: anthropicResponse.status,
        headers: {
          "cache-control": "no-store",
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  const result = (await anthropicResponse.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const reply = (result.content ?? [])
    .filter((item) => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n");

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
