import { getServerSession } from "next-auth";
import Link from "next/link";
import { Bell, BriefcaseBusiness, Lightbulb, Sparkles, Star, Trophy, CheckCircle2 } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";
import { NotificationItem } from "@/types/saas";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function notificationIcon(type: NotificationItem["type"]) {
  if (type === "mission") return <BriefcaseBusiness className="h-5 w-5 shrink-0 text-sky-400" />;
  if (type === "achievement") return <Trophy className="h-5 w-5 shrink-0 text-amber-400" />;
  if (type === "recommendation") return <Lightbulb className="h-5 w-5 shrink-0 text-violet-400" />;
  if (type === "job") return <Star className="h-5 w-5 shrink-0 text-emerald-400" />;
  return <Sparkles className="h-5 w-5 shrink-0 text-slate-400" />;
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  
  const data = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!data) {
    return (
      <EmptyState
        title="Нет данных"
        description="Не удалось загрузить ваши уведомления."
        actionLabel="На главную"
        actionHref="/"
      />
    );
  }

  const notifications = data.notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
              <Bell className="h-6 w-6" />
            </span>
            Центр уведомлений
          </h1>
          <p className="text-sm text-foreground/60 mt-2">
            Следите за прогрессом, новыми миссиями и возможностями для карьеры.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 text-xs font-bold text-sky-400">
            {unreadCount} непрочитанных
          </span>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-background text-xs font-bold text-foreground/70 transition-colors">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Прочитать все
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="surface-elevated border border-border/50 bg-card/40 backdrop-blur-md rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Bell className="h-12 w-12 text-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-foreground">Нет уведомлений</h3>
            <p className="text-sm text-foreground/60 mt-1">Здесь будут отображаться ваши новые миссии, награды и достижения.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-start sm:items-center gap-4 rounded-2xl p-4 sm:p-5 transition-all duration-300 surface-elevated backdrop-blur-md border outline-none overflow-hidden",
                !item.isRead 
                  ? "bg-sky-500/5 border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-500/10 shadow-[0_4px_20px_rgba(56,189,248,0.05)]" 
                  : "bg-card/40 border-border/50 hover:bg-card/60"
              )}
            >
              {!item.isRead && (
                <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-sky-500/10 blur-[40px] rounded-full pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
              )}
              
              <span className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-inner relative z-10",
                !item.isRead ? "bg-sky-500/10 border-sky-500/20" : "bg-background/50 border-border/50"
              )}>
                {notificationIcon(item.type)}
              </span>
              
              <div className="min-w-0 flex-1 relative z-10 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <p className={cn("text-base font-bold", item.isRead ? "text-foreground/90" : "text-foreground drop-shadow-sm")}>
                    {item.title}
                  </p>
                  <p className="text-xs font-semibold text-foreground/50 flex-shrink-0">
                    {new Date(item.createdAt).toLocaleString("ru-RU", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className={cn("text-sm leading-relaxed", item.isRead ? "text-foreground/60" : "text-foreground/80")}>
                  {item.body}
                </p>
              </div>
              
              {!item.isRead && (
                <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-sky-400 mt-2 sm:mt-0 relative z-10 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
