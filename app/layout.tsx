import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "@/styles/globals.css";

import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "SkillPath Academy",
  description: "Learning platform for QA engineers, business analysts, and data analysts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
              <div className="absolute -left-44 top-[-180px] h-[440px] w-[440px] rounded-full bg-cyan-500/14 blur-3xl" />
              <div className="absolute right-[-180px] top-[8%] h-[420px] w-[420px] rounded-full bg-violet-500/14 blur-3xl" />
              <div className="absolute bottom-[-220px] left-1/3 h-[460px] w-[460px] rounded-full bg-indigo-500/12 blur-3xl" />
              <div className="absolute left-[42%] top-[16%] h-[140px] w-[140px] rounded-full bg-sky-400/10 blur-2xl" />
            </div>
            <AppShell>{children}</AppShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
