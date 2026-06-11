import "server-only";

/**
 * Provider-agnostic email sender. Uses Resend when RESEND_API_KEY is set,
 * otherwise logs to the console (dev/demo) so flows are testable without a key.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailResult = { delivered: boolean; dev: boolean };

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Levio <onboarding@resend.dev>";

  if (!apiKey) {
    // Dev fallback: surface the email (including any action link) in logs.
    console.info(
      `[email:dev] to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
    return { delivered: false, dev: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html ?? `<pre>${message.text}</pre>`,
      }),
    });
    return { delivered: response.ok, dev: false };
  } catch {
    return { delivered: false, dev: false };
  }
}
