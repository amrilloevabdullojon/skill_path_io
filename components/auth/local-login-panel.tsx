"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, UserRound } from "lucide-react";

import { getLocalAuthUsers, LocalUserRole } from "@/lib/auth/local-users";

const roleIcon = {
  ADMIN: Shield,
  STUDENT: UserRound,
} as const;

export function LocalLoginPanel() {
  const router = useRouter();
  const users = useMemo(() => getLocalAuthUsers(), []);
  const [pendingRole, setPendingRole] = useState<LocalUserRole | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleLogin(role: LocalUserRole) {
    const user = users.find((candidate) => candidate.role === role);
    if (!user) {
      setErrorText("Missing local demo user.");
      return;
    }

    setPendingRole(role);
    setErrorText(null);

    const result = await signIn("credentials", {
      email: user.email,
      password: "local",
      redirect: false,
      callbackUrl: user.redirectPath,
    });

    if (!result?.ok) {
      setPendingRole(null);
      setErrorText("Could not start local session. Please try again.");
      return;
    }

    router.push(result.url ?? user.redirectPath);
    router.refresh();
  }

  return (
    <div className="surface-elevated space-y-4 p-5 sm:p-6">
      <div>
        <p className="kicker">Demo access</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Continue to your workspace</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a role to preview student or admin flows locally.
        </p>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const Icon = roleIcon[user.role];
          const isPending = pendingRole === user.role;

          return (
            <button
              key={user.role}
              type="button"
              onClick={() => handleLogin(user.role)}
              disabled={Boolean(pendingRole)}
              className="surface-subtle surface-panel-hover flex w-full items-center justify-between gap-3 p-4 text-left transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    user.role === "ADMIN"
                      ? "bg-orange-500/15 text-orange-300"
                      : "bg-emerald-500/15 text-emerald-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    Continue as {user.role === "ADMIN" ? "Admin" : "Student"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enter</span>
              )}
            </button>
          );
        })}
      </div>

      {errorText && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {errorText}
        </p>
      )}
    </div>
  );
}
