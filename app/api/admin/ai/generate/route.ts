import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { applyRateLimit } from "@/lib/server/rate-limit";
import { parseAdminAiRequest } from "@/lib/validation/admin-ai";
import { AdminAiRequest, AdminAiResponse, AdminAiTool } from "@/types/admin/ai";

export const runtime = "nodejs";

function getIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

function buildMockResult(tool: AdminAiTool, context: AdminAiRequest["context"]) {
  const course = context.courseTitle || "Course";
  const moduleTitle = context.moduleTitle || "Module";
  const lesson = context.lessonTitle || "Lesson";
  const description = context.description || "";

  if (tool === "generate_tags") {
    return "practice, fundamentals, assessment, workflow";
  }
  if (tool === "generate_learning_outcomes") {
    return "Apply core concepts, complete practical tasks, pass module assessments, explain decisions to stakeholders";
  }
  if (tool === "generate_module_outline") {
    return `1) ${moduleTitle}: overview\n2) Key framework and workflow\n3) Practical exercise\n4) Quiz checkpoint\n5) Reflection and summary`;
  }
  if (tool === "generate_lesson_draft") {
    return `# ${lesson}\n\nThis lesson explains the core idea in simple terms.\n\n## Why it matters\nUse it to deliver predictable outcomes in real projects.\n\n## Practical steps\n1. Read requirements\n2. Define approach\n3. Validate with checklist`;
  }
  if (tool === "improve_lesson_text") {
    return `Improved lesson text:\n\n${description || "Start with context, then provide steps, examples, and a short checklist."}`;
  }
  if (tool === "simplify_for_beginners") {
    return "Simplified version: explain each concept with one example, avoid jargon, and end each section with a mini checklist.";
  }
  if (tool === "generate_quiz_questions") {
    return `1) What is the primary outcome of ${moduleTitle}?\n2) Which step should come first in the workflow?\n3) Select two quality signals for successful completion.`;
  }
  if (tool === "generate_assignment") {
    return `Assignment: create a practical artifact for ${moduleTitle}.\nExpected output: structured report with assumptions, steps, and validation criteria.`;
  }
  if (tool === "generate_case_study") {
    return `Case: ${course} student receives an incomplete brief.\nTask: identify gaps, create an action plan, and justify priorities.`;
  }
  return `Course description for ${course}: practical, role-focused program with lessons, quizzes, assignments, and simulations.`;
}

function toolInstruction(tool: AdminAiTool) {
  const map: Record<AdminAiTool, string> = {
    generate_course_description: "Create a concise course description.",
    generate_learning_outcomes: "Generate clear learning outcomes.",
    generate_module_outline: "Generate a module outline.",
    generate_lesson_draft: "Generate a lesson draft in markdown.",
    improve_lesson_text: "Improve lesson text quality and clarity.",
    simplify_for_beginners: "Simplify text for absolute beginners.",
    generate_quiz_questions: "Generate quiz questions.",
    generate_assignment: "Generate assignment instructions.",
    generate_case_study: "Generate a practical case study.",
    generate_tags: "Generate comma-separated tags.",
  };
  return map[tool];
}

async function requestAnthropic(payload: AdminAiRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-sonnet-latest";
  const maxTokensRaw = Number(process.env.ANTHROPIC_MAX_TOKENS);
  const maxTokens = Number.isFinite(maxTokensRaw) && maxTokensRaw > 0 ? Math.floor(maxTokensRaw) : 700;
  const contextText = [
    `Course: ${payload.context.courseTitle || "N/A"}`,
    `Module: ${payload.context.moduleTitle || "N/A"}`,
    `Lesson: ${payload.context.lessonTitle || "N/A"}`,
    `Description: ${payload.context.description || ""}`,
    `Content: ${(payload.context.content || "").slice(0, 2200)}`,
    `Tags: ${(payload.context.tags || []).join(", ")}`,
  ].join("\n");

  const prompt = [
    `Task: ${toolInstruction(payload.tool)}`,
    "Return practical educational content in Russian.",
    "Be concise, structured, and production-ready for LMS content authoring.",
    payload.prompt ? `Custom admin prompt: ${payload.prompt}` : "",
    `Context:\n${contextText}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.35,
      system: "You are an LMS content architect helping admin users build high quality courses.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = (body.content || [])
    .filter((item) => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text?.trim() || "")
    .filter(Boolean)
    .join("\n\n");
  return text || null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getIp(request);
  const maxReq = Number(process.env.ADMIN_AI_RATE_LIMIT_MAX_REQUESTS);
  const windowMsRaw = Number(process.env.ADMIN_AI_RATE_LIMIT_WINDOW_MS);
  const rateLimit = applyRateLimit({
    key: `admin-ai:${ip}`,
    maxRequests: Number.isFinite(maxReq) && maxReq > 0 ? Math.floor(maxReq) : 30,
    windowMs: Number.isFinite(windowMsRaw) && windowMsRaw > 0 ? Math.floor(windowMsRaw) : 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
          "retry-after": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = parseAdminAiRequest(rawBody);
  if (!body) {
    return NextResponse.json({ error: "Missing tool or context" }, { status: 400 });
  }

  const anthropicText = await requestAnthropic(body);
  const resultText = anthropicText ?? buildMockResult(body.tool, body.context);
  const response: AdminAiResponse = {
    result: resultText,
    suggestions: [
      "Review generated content before publishing.",
      "Adapt wording to target audience and track level.",
      "Save a version snapshot after applying AI output.",
    ],
    source: anthropicText ? "anthropic" : "mock",
  };

  return NextResponse.json(response, {
    headers: {
      "x-ratelimit-limit": String(rateLimit.limit),
      "x-ratelimit-remaining": String(rateLimit.remaining),
      "x-ratelimit-reset": String(rateLimit.resetAt),
    },
  });
}
