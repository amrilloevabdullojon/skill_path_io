/**
 * Uniform return type for all admin server actions.
 *
 * Server actions called via `action={}` on plain HTML forms ignore the return
 * value, so existing form UI is unaffected.  Client components that call
 * actions programmatically (startTransition / useActionState) can now inspect
 * the result and surface errors to the user.
 */
export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/** Return on successful action. */
export function actionOk<T>(data?: T): ActionResult<T> {
  return { ok: true, data };
}

/**
 * Return on validation failure or DB error.
 * Always logs to console so silent failures leave a trace in server logs.
 */
export function actionErr(message: string, context?: string): ActionResult<never> {
  console.warn(`[admin action] ${context ? `[${context}] ` : ""}${message}`);
  return { ok: false, error: message };
}
