"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

export function ClientDate() {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setFormattedDate(
      new Intl.DateTimeFormat("ru-RU", {
        weekday: "short",
        month: "long",
        day: "numeric",
      }).format(new Date())
    );
  }, []);

  if (!formattedDate) return null;

  return (
    <span className="topbar-info-pill">
      <CalendarDays className="topbar-info-pill-icon h-3.5 w-3.5" />
      {formattedDate}
    </span>
  );
}
