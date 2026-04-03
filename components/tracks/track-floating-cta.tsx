"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TrackFloatingCtaProps = {
  href: string;
  label: string;
};

export function TrackFloatingCta({ href, label }: TrackFloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-6 left-0 right-0 z-50 flex justify-center transition-all duration-300 lg:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0 pointer-events-none",
      )}
    >
      <Link
        href={href}
        className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold shadow-xl shadow-black/30"
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
