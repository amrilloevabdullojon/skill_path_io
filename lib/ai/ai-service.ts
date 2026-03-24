/**
 * Unified AI Service facade.
 *
 * Centralises:
 *  - Anthropic API calls
 *  - Rate limiting
 *  - System-prompt builders
 *  - Structured result types
 */

import { getServerEnv } from "@/lib/config/env";
import { applyRateLimit } from "@/lib/server/rate-limit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AiRole = "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiCallOptions {
  systemPrompt: string;
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
}

export type AiResult<T = string> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

// ─── Client IP helper ────────────────────────────────────────────────────────

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() ?? "local";
}

// ─── Core Anthropic call ─────────────────────────────────────────────────────

/**
 * Low-level call to the Anthropic Messages API.
 * Returns the text content or throws on failure.
 */
export async function callAnthropic(opts: AiCallOptions): Promise<AiResult> {
  let env;
  try {
    env = getServerEnv();
  } catch (err) {
    return { ok: false, status: 500, error: "Server environment misconfigured" };
  }

  if (!env.anthropicApiKey) {
    return { ok: false, status: 500, error: "ANTHROPIC_API_KEY is not configured" };
  }

  const model = env.anthropicModel ?? "claude-3-5-sonnet-latest";
  const maxTokens = opts.maxTokens ?? env.anthropicMaxTokens ?? 700;

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: opts.temperature ?? 0.4,
        system: opts.systemPrompt,
        messages: opts.messages,
      }),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Network error";
    return { ok: false, status: 502, error: `Anthropic request failed: ${detail}` };
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return {
      ok: false,
      status: response.status >= 500 ? 502 : response.status,
      error: `Anthropic error ${response.status}: ${text.slice(0, 500)}`,
    };
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = (data.content ?? [])
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text!.trim())
    .filter(Boolean)
    .join("\n\n");

  return { ok: true, data: text };
}

// ─── Rate-limiting wrapper ───────────────────────────────────────────────────

export interface WithRateLimitOptions {
  request: Request;
  /** Unique prefix for the key bucket, e.g. "mentor" | "interview" */
  bucket: string;
  maxRequests?: number;
  windowMs?: number;
}

export type RateLimitCheck =
  | { allowed: true; headers: Record<string, string> }
  | { allowed: false; headers: Record<string, string>; retryAfterMs: number };

export function checkRateLimit({
  request,
  bucket,
  maxRequests = 20,
  windowMs = 60_000,
}: WithRateLimitOptions): RateLimitCheck {
  const ip = getClientIp(request);
  const result = applyRateLimit({ key: `${bucket}:${ip}`, maxRequests, windowMs });

  const headers: Record<string, string> = {
    "cache-control": "no-store",
    "x-ratelimit-limit": String(result.limit),
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(result.resetAt),
  };

  if (!result.allowed) {
    headers["retry-after"] = String(Math.ceil(result.retryAfterMs / 1000));
    return { allowed: false, headers, retryAfterMs: result.retryAfterMs };
  }

  return { allowed: true, headers };
}

// ─── Shared prompt builders ──────────────────────────────────────────────────

export function buildMentorPrompt(params: {
  trackTitle: string;
  moduleTitle: string;
  lessonText: string;
}): string {
  return [
    `You are an experienced mentor of SkillPath Academy.`,
    `The student is studying module '${params.moduleTitle}' in track '${params.trackTitle}'.`,
    `Reply in Russian language. Explain simply with examples. Share practical advice from real experience. Use emoji for clarity.`,
    `\nLesson context (up to 2000 chars):\n${params.lessonText || "Lesson context is missing."}`,
  ].join("\n");
}

export function buildReviewPrompt(params: {
  type: "quiz" | "exercise" | "mission";
  topic: string;
  submission: string;
  criteria?: string;
}): string {
  const typeLabel =
    params.type === "quiz" ? "quiz answer" : params.type === "mission" ? "mission submission" : "exercise solution";

  return [
    `You are a strict but fair SkillPath Academy reviewer. Evaluate the student's ${typeLabel}.`,
    `Topic: ${params.topic}`,
    params.criteria ? `Evaluation criteria: ${params.criteria}` : "",
    `Reply in Russian language. Be concise and constructive. Give a score from 0 to 100 and explain the main strengths and weaknesses.`,
    `\nStudent submission:\n${params.submission.slice(0, 3000)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildInterviewPrompt(params: {
  track: string;
  role: string;
  action: "start" | "evaluate" | "feedback";
  content?: string;
}): string {
  if (params.action === "start") {
    return [
      `You are a professional interviewer at a tech company hiring for a ${params.role} position in ${params.track}.`,
      `Conduct a mock technical interview in Russian language.`,
      `Start with a brief introduction and then ask the first technical question.`,
      `Keep it realistic and professional.`,
    ].join("\n");
  }

  if (params.action === "evaluate") {
    return [
      `You are evaluating a candidate's interview answer for a ${params.role} role in ${params.track}.`,
      `Reply in Russian language. Be professional and constructive.`,
      `Give detailed feedback on the answer quality and suggest improvements.`,
      params.content ? `\nCandidate answer:\n${params.content.slice(0, 2000)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `You are a professional ${params.role} interviewer. Continue the mock interview for ${params.track} track.`,
    `Reply in Russian language. Keep the interview realistic.`,
    params.content ? `\nContext:\n${params.content.slice(0, 1000)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
