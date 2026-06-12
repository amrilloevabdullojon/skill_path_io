"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function ResetPasswordClient() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (response.ok) {
        setDone(true);
      } else {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(body?.message ?? "This reset link is invalid or has expired.");
      }
    } catch {
      setError("Could not reset your password. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-md rounded-2xl border border-border bg-card p-8">
      <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>

      {done ? (
        <>
          <p className="mt-4 text-sm text-emerald-400">
            Your password has been updated. You can sign in with it now.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Go to sign in
          </Link>
        </>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 8 characters)"
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground"
            autoComplete="new-password"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground"
            autoComplete="new-password"
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting || !password || !confirm}
            className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update password"}
          </button>
          <Link href="/login" className="text-center text-sm text-muted-foreground">
            Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
