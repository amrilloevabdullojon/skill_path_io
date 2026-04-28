import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { PortfolioBuilder } from "@/components/portfolio/portfolio-builder";
import { PortfolioSettings } from "@/components/portfolio/portfolio-settings";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";
import { buildRuntimePortfolioSeed } from "@/lib/portfolio/runtime-portfolio";
import { prisma } from "@/lib/prisma";
import { PortfolioEntry } from "@/types/personalization";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Портфолио — Levio",
  description: "Ваше профессиональное резюме, построенное на пройденных миссиях и достижениях.",
  robots: { index: false },
};

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);

  // Load real portfolio from DB if user is authenticated
  let dbEntries: PortfolioEntry[] | null = null;
  let publicSlug = "";
  let isPublic = false;

  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (user) {
        const portfolio = await prisma.portfolio.findUnique({
          where: { userId: user.id },
          include: {
            projects: {
              orderBy: { order: "asc" },
            },
          },
        });
        if (portfolio) {
          publicSlug = portfolio.publicSlug || "";
          isPublic = portfolio.isPublic;

          if (portfolio.projects.length > 0) {
            dbEntries = portfolio.projects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            skillsUsed: p.skillsUsed,
            resultSummary: p.resultSummary,
            source: (p.source as PortfolioEntry["source"]) ?? "module",
            sourceRef: p.sourceRef,
            createdAt: p.createdAt.toISOString(),
          }));
          }
        }
      }
    } catch {
      // Fall through to seed-based entries
    }
  }

  // Fall back to dashboard-derived entries
  const dashboard = dbEntries
    ? null
    : await getDashboardData({
        preferredEmail: session?.user?.email,
        sessionRole: session?.user?.role,
      });

  const initialEntries = dbEntries ?? buildRuntimePortfolioSeed(dashboard);

  return (
    <section className="page-shell">
      {session?.user?.email && (
        <PortfolioSettings initialSlug={publicSlug} initialIsPublic={isPublic} />
      )}
      <PortfolioBuilder initialEntries={initialEntries} />
    </section>
  );
}


