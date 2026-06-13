"use client";

import { CalendarDays } from "lucide-react";

import { useIsClient } from "@/hooks/use-is-client";

export function ClientDate() {
  const isClient = useIsClient();

  if (!isClient) return null;

  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <span className="topbar-info-pill">
      <CalendarDays className="topbar-info-pill-icon h-3.5 w-3.5" />
      {formattedDate}
    </span>
  );
}
