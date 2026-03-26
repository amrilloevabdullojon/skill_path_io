"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { setLocale } from "@/app/actions/locale";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const currentLocale = useLocale();
  const router = useRouter();

  async function handleSwitch(code: string) {
    await setLocale(code);
    router.refresh();
  }

  return (
    <div
      className={cn(
        "lang-switcher flex items-center gap-0.5 p-0.5",
        className,
      )}
      aria-label={t("switchTo")}
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => void handleSwitch(code)}
          aria-pressed={currentLocale === code}
          className={cn(
            "h-8 rounded-lg px-2.5 text-xs font-semibold transition-colors",
            currentLocale === code ? "lang-btn-active" : "lang-btn",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
