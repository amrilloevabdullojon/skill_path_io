import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="site-footer relative z-10">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-3 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Levio Local Edition</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="site-footer-link">{t("today")}</Link>
          <Link href="/tracks" className="site-footer-link">{t("study")}</Link>
          <Link href="/missions" className="site-footer-link">{t("practice")}</Link>
          <Link href="/dashboard?tab=skills" className="site-footer-link">{t("progress")}</Link>
          <Link href="/portfolio" className="site-footer-link">{t("portfolio")}</Link>
        </div>
      </div>
    </footer>
  );
}
