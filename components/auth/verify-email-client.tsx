"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Status = "verifying" | "ok" | "error";

export function VerifyEmailClient() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch("/api/v1/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((response) => {
        if (active) setStatus(response.ok ? "ok" : "error");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="mx-auto mt-24 w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">Email verification</h1>
      {status === "verifying" ? (
        <p className="mt-4 text-sm text-muted-foreground">Verifying your email…</p>
      ) : status === "ok" ? (
        <p className="mt-4 text-sm text-emerald-400">Your email is verified. You can sign in.</p>
      ) : (
        <p className="mt-4 text-sm text-red-400">
          This verification link is invalid or has expired. Request a new one from your account.
        </p>
      )}
      <Link
        href="/login"
        className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Go to sign in
      </Link>
    </div>
  );
}
