"use client";

import { useSession } from "next-auth/react";
import { AppRoleEnum } from "@/types/next-auth";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRoleEnum[];
  fallbackMessage?: string;
  showFallbackInfo?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackMessage = "У вас нет доступа к этому разделу.",
  showFallbackInfo = true 
}: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    // Skeleton placeholder to prevent layout shift while checking session
    return <Skeleton className="min-h-[200px] rounded-xl" />;
  }

  // If user has one of the allowed roles, render the content
  const hasAccess = session?.user?.role && allowedRoles.includes(session.user.role as AppRoleEnum);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If blocked, optionally render a clean fallback UI with a CTA
  if (showFallbackInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-rose-500/20 bg-rose-500/5 rounded-2xl max-w-xl mx-auto my-8">
        <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Доступ ограничен</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-[400px]">
          {fallbackMessage} Эта часть платформы доступна только для пользователей с ролями: {allowedRoles.join(", ")}.
        </p>
        <Link 
          href="/pro" 
          className="px-6 py-2.5 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
        >
          Улучшить подписку
        </Link>
      </div>
    );
  }

  // If silent guard, just return nothing
  return null;
}
