export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard/data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const defaultUser = await prisma.user.findFirst({ select: { email: true, role: true }});
    const sessionRole = defaultUser?.role === "ADMIN" ? "ADMIN" : "STUDENT";
    const data = await getDashboardData({ preferredEmail: defaultUser?.email, sessionRole });
    return NextResponse.json({ success: true, keys: Object.keys(data ?? {}) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { success: false, error: message, stack },
      { status: 500 }
    );
  }
}
