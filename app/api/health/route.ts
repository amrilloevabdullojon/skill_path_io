import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
// Never cache — always reflect real-time state
export const dynamic = "force-dynamic";

type HealthStatus = "ok" | "degraded" | "error";

interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: HealthStatus; latencyMs?: number; error?: string };
  };
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const start = Date.now();
  let dbStatus: HealthStatus = "ok";
  let dbLatencyMs: number | undefined;
  let dbError: string | undefined;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "Unknown database error";
  }

  const overallStatus: HealthStatus = dbStatus === "error" ? "error" : "ok";
  const httpStatus = overallStatus === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbStatus,
          ...(dbLatencyMs !== undefined && { latencyMs: dbLatencyMs }),
          ...(dbError !== undefined && { error: dbError }),
        },
      },
    },
    { status: httpStatus },
  );
}
