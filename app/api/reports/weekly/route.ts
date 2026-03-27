import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { Errors, apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { getDashboardData } from "@/lib/dashboard/data";

export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!dashboard) throw Errors.notFound("No weekly report available.");

  return apiOk({ report: dashboard.weeklyAiReport });
});
