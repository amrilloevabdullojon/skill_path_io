import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardLayoutProps = {
  topbar: ReactNode;
  sidebar?: ReactNode;
  insights: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({ topbar, sidebar, insights, children }: DashboardLayoutProps) {
  const hasSidebar = Boolean(sidebar);

  return (
    <div
      className={cn(
        "grid items-start gap-6",
        hasSidebar
          ? "xl:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)_320px]"
          : "xl:grid-cols-[minmax(0,1fr)_320px]",
      )}
    >
      {hasSidebar ? <aside className="hidden min-w-0 self-start xl:block">{sidebar}</aside> : null}

      <div className="min-w-0 space-y-6">
        {topbar}
        <div className="min-w-0 space-y-6">{children}</div>
      </div>

      <aside className="hidden min-w-0 self-start xl:block">{insights}</aside>
    </div>
  );
}
