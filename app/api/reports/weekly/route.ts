import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";

export async function GET() {
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!dashboard) {
    return NextResponse.json({ error: "No weekly report available." }, { status: 404 });
  }

  return NextResponse.json(
    {
      report: dashboard.weeklyAiReport,
    },
    { status: 200 },
  );
}
