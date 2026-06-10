export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard/data";
import { verifyAdminAccess } from "@/lib/auth/server-verify";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await verifyAdminAccess();
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  try {
    const defaultUser = await prisma.user.findFirst({ select: { email: true, role: true }});
    const sessionRole = defaultUser?.role === "ADMIN" ? "ADMIN" : "STUDENT";
    const data = await getDashboardData({ preferredEmail: defaultUser?.email, sessionRole });
    return NextResponse.json({ success: true, keys: Object.keys(data ?? {}) });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[health:test-dashboard]", error);
    }
    return NextResponse.json(
      { success: false, error: "Dashboard health check failed" },
      { status: 500 }
    );
  }
}
