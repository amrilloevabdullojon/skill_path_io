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

      {/* Shown below main content on lg and smaller; hidden on xl+ where it moves to the grid column */}
      <aside className="min-w-0 self-start xl:hidden">{insights}</aside>

      {/* In the grid's right column on xl+ */}
      <aside className="hidden min-w-0 self-start xl:block">{insights}</aside>
    </div>
  );
}
