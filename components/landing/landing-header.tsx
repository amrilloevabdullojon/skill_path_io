"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { cn } from "@/lib/utils";

type NavItem = { labelKey: string; href: string };

const navItems: NavItem[] = [
  { labelKey: "tracks", href: "#tracks" },
  { labelKey: "missions", href: "#missions" },
  { labelKey: "career", href: "#career" },
  { labelKey: "pricing", href: "#pricing" },
  { labelKey: "about", href: "#about" },
];

export function LandingHeader() {
  const t = useTranslations("landing.header");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 12);
      setMobileOpen(false);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 z-50">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[112rem] items-center justify-between rounded-2xl border px-3 py-2.5 transition-all sm:px-4",
          isScrolled
            ? "border-border/90 bg-background/88 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-lg"
            : "border-border/50 bg-background/45 backdrop-blur-sm",
        )}
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/15 text-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          SkillPath Academy
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a key={item.labelKey} href={item.href} className="nav-link text-sm">
              {t(item.labelKey as Parameters<typeof t>[0])}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "h-9 px-3")}>
            {t("login")}
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "h-9 px-4")}>
            {t("startLearning")}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="btn-secondary h-9 w-9 p-0 lg:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mx-auto mt-2 w-full max-w-[112rem] rounded-2xl border border-border/90 bg-background/92 p-3 backdrop-blur-lg lg:hidden">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.labelKey}
                href={item.href}
                className="nav-link block"
                onClick={() => setMobileOpen(false)}
              >
                {t(item.labelKey as Parameters<typeof t>[0])}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <LanguageSwitcher className="w-full justify-center" />
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full")}>
                {t("login")}
              </Link>
              <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "h-9 w-full")}>
                {t("startLearning")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
