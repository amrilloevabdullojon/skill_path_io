import "server-only";

import { getServerEnv } from "@/lib/config/env";

type AiCompletionInput = {
  systemPrompt: string;
  userPrompt: string;
  fallback: string;
  temperature?: number;
  maxTokens?: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function requestAiCompletion({
  systemPrompt,
  userPrompt,
  fallback,
  temperature = 0.4,
  maxTokens = 2048,
}: AiCompletionInput): Promise<string> {
  const { geminiApiKey, geminiModel } = getServerEnv();
  if (!geminiApiKey) return fallback;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) return fallback;

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}
