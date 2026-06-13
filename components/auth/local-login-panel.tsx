"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, UserRound } from "lucide-react";

import { getLocalAuthUsers, LocalUserRole } from "@/lib/auth/local-users";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 relative z-10">
          Демо Доступ
        </p>
        <h2 className="section-title text-foreground drop-shadow-sm">Войти в систему</h2>
        <p className="mt-1.5 text-sm text-foreground/60 font-medium">
          Выберите роль, чтобы протестировать платформу с точки зрения администратора или студента.
        </p>
      </div>

      <div className="space-y-4">
        {users.map((user) => {
          const Icon = roleIcon[user.role];
          const isPending = pendingRole === user.role;
          const isAdmin = user.role === "ADMIN";

          return (
            <button
              key={user.role}
              type="button"
              onClick={() => handleLogin(user.role)}
              disabled={Boolean(pendingRole)}
              className={cn(
                "group flex w-full items-center justify-between gap-4 p-5 text-left transition-all duration-300 rounded-2xl border backdrop-blur-sm relative overflow-hidden",
                isAdmin 
                  ? "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40 hover:bg-orange-500/10 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] hover:-translate-y-0.5" 
                  : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] hover:-translate-y-0.5",
                pendingRole && "opacity-60 cursor-not-allowed transform-none"
              )}
            >
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
                isAdmin ? "bg-orange-500/20" : "bg-emerald-500/20"
              )} />
              
              <div className="flex min-w-0 items-center gap-4 relative z-10">
                <span
                  className={cn(
                    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    isAdmin
                      ? "bg-orange-500/15 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      : "bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-lg transition-colors group-hover:text-foreground">
                    {isAdmin ? "Администратор" : "Студент"}
                  </p>
                  <p className="truncate text-xs text-foreground/50 font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="relative z-10 shrink-0">
                {isPending ? (
                  <Loader2 className={cn(
                    "h-5 w-5 animate-spin",
                    isAdmin ? "text-orange-400" : "text-emerald-400"
                  )} />
                ) : (
                  <span className={cn(
                    "text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors",
                    isAdmin
                      ? "border-orange-500/30 text-orange-500/70 group-hover:border-orange-500 group-hover:text-orange-400 bg-orange-500/5 group-hover:bg-orange-500/10"
                      : "border-emerald-500/30 text-emerald-500/70 group-hover:border-emerald-500 group-hover:text-emerald-400 bg-emerald-500/5 group-hover:bg-emerald-500/10"
                  )}>
                    Войти
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {errorText && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-400">
          {errorText}
        </p>
      )}
    </div>
  );
}
