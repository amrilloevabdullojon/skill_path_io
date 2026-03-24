type AiCompletionInput = {
  systemPrompt: string;
  userPrompt: string;
  fallback: string;
  temperature?: number;
  maxTokens?: number;
};

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
const DEFAULT_MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS || 700);

export async function requestAiCompletion({
  systemPrompt,
  userPrompt,
  fallback,
  temperature = 0.4,
  maxTokens = DEFAULT_MAX_TOKENS,
}: AiCompletionInput) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };

    const text = (data.content ?? [])
      .filter((item) => item.type === "text" && typeof item.text === "string")
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n");

    return text || fallback;
  } catch {
    return fallback;
  }
}
