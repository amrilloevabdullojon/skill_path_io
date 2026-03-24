import { Bell } from "lucide-react";

import { NotificationItem } from "@/types/saas";

type NotificationsCenterProps = {
  notifications: NotificationItem[];
};

export function NotificationsCenter({ notifications }: NotificationsCenterProps) {
  return (
    <section id="notifications" className="surface-elevated space-y-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="section-title">Notifications</h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300">
          <Bell className="h-3.5 w-3.5" />
          {notifications.length}
        </span>
      </div>
      <div className="space-y-2">
        {notifications.map((item) => (
          <article key={item.id} className="surface-subtle space-y-1 p-3">
            <p className="text-sm font-semibold text-slate-100">{item.title}</p>
            <p className="text-xs text-slate-300">{item.body}</p>
            <p className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
