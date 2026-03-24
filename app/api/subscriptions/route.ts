import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";
import { listSubscriptionPlans } from "@/lib/saas/subscriptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const [dashboard, plans] = await Promise.all([
    getDashboardData({
      preferredEmail: session?.user?.email,
      sessionRole: session?.user?.role,
    }),
    listSubscriptionPlans(),
  ]);

  if (!dashboard) {
    return NextResponse.json({ error: "No dashboard data available." }, { status: 404 });
  }

  return NextResponse.json(
    {
      subscription: dashboard.subscription,
      plans,
    },
    { status: 200 },
  );
}
