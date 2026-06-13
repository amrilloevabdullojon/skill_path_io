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

// ─── Core Gemini call ────────────────────────────────────────────────────────

/**
 * Low-level call to the Google Gemini API.
 * Returns the text content or an error result.
 * Named callAnthropic for backward compatibility with existing callers.
 */
export async function callAnthropic(opts: AiCallOptions): Promise<AiResult> {
  const env = getServerEnv();
  
  // 1. Try Gemini first if key is present
  if (env.geminiApiKey) {
    const apiKey = env.geminiApiKey;
    const model = env.geminiModel || "gemini-1.5-flash";
    const maxTokens = opts.maxTokens ?? 2048;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = opts.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: opts.systemPrompt }] },
          generationConfig: { temperature: opts.temperature ?? 0.4, maxOutputTokens: maxTokens },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text?.trim() ?? "")
          .filter(Boolean)
          .join("\n\n") ?? "";
        return { ok: true, data: text };
      }
      
      // If error but it's auth/rate limit, might not want to fallback. 
      // But let's just log and let it fallback to Anthropic.
      console.warn(`Gemini API error: ${response.status}`);
    } catch (err) {
      console.warn(`Gemini fetch failed:`, err);
    }
  }

  // 2. Fallback to Anthropic if Gemini fails/missing and Anthropic is configured
  if (env.anthropicApiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.anthropicApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: env.anthropicModel || "claude-3-haiku-20240307",
          max_tokens: opts.maxTokens ?? 1024,
          temperature: opts.temperature ?? 0.4,
          system: opts.systemPrompt,
          messages: opts.messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { ok: true, data: data.content?.[0]?.text ?? "" };
      }
      
      const text = await response.text().catch(() => "");
      return { ok: false, status: response.status, error: `Anthropic error ${response.status}: ${text.slice(0, 500)}` };
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Network error";
      return { ok: false, status: 502, error: `Anthropic request failed: ${detail}` };
    }
  }

  return { ok: false, status: 500, error: "AI service is not accessible. Check network connection or API Keys in .env.local" };
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
    `You are an experienced mentor of Levio.`,
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
    `You are a strict but fair Levio reviewer. Evaluate the student's ${typeLabel}.`,
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
