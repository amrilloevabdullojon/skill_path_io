import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { Errors, apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { getDashboardData } from "@/lib/dashboard/data";
import { listSubscriptionPlans } from "@/lib/saas/subscriptions";

export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions);
  const [dashboard, plans] = await Promise.all([
    getDashboardData({
      preferredEmail: session?.user?.email,
      sessionRole: session?.user?.role,
    }),
    listSubscriptionPlans(),
  ]);

  if (!dashboard) throw Errors.notFound("No dashboard data available.");

  return apiOk({ subscription: dashboard.subscription, plans });
});
