import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { apiOk, withErrorHandler } from "@/lib/api/error-handler";
import { getUserNotifications } from "@/lib/notifications/service";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return apiOk({ notifications: [] });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return apiOk({ notifications: [] });
  }

  const notifications = await getUserNotifications(user.id);
  return apiOk({ notifications });
});
