import type { ActionResult } from "@/lib/admin/action-result";

// React 18.3 exposes this interface as the official extension point for
// server-action return types on <form action={...}> elements.
// Next.js 14 server actions can return values; this shim makes TypeScript
// accept Promise<ActionResult> where Promise<void> was previously expected.
declare module "react" {
  interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS {
    serverActionResult: (formData: FormData) => Promise<ActionResult>;
  }
}
