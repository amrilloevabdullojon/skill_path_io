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
        <span className="xp-pill inline-flex items-center gap-1 px-2.5 py-1 text-xs">
          <Bell className="h-3.5 w-3.5" />
          {notifications.length}
        </span>
      </div>
      <div className="space-y-2">
        {notifications.map((item) => (
          <article key={item.id} className="surface-subtle space-y-1 p-3">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.body}</p>
            <p className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
