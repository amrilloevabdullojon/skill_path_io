import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getUserNotifications } from "@/lib/notifications/service";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
// SSE connections should not be cached
export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 15_000; // 15 seconds
const MAX_DURATION_MS = 55_000;  // close before Vercel's 60s timeout

/**
 * Server-Sent Events endpoint for real-time notifications.
 * Streams notification updates to the client via SSE.
 *
 * Client usage:
 *   const es = new EventSource('/api/notifications/stream');
 *   es.addEventListener('notifications', (e) => {
 *     const { notifications } = JSON.parse(e.data);
 *   });
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const userId = user.id;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const startTime = Date.now();

      function send(event: string, data: unknown) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      function sendKeepAlive() {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }

      // Send initial notifications immediately
      try {
        const notifications = await getUserNotifications(userId);
        send("notifications", { notifications });
      } catch {
        send("notifications", { notifications: [] });
      }

      // Poll at interval and close after max duration
      let pollCount = 0;
      const interval = setInterval(async () => {
        pollCount++;

        // Close connection after max duration
        if (Date.now() - startTime >= MAX_DURATION_MS) {
          clearInterval(interval);
          send("close", { reason: "reconnect" });
          controller.close();
          return;
        }

        try {
          const notifications = await getUserNotifications(userId);
          send("notifications", { notifications });
        } catch {
          sendKeepAlive();
        }
      }, POLL_INTERVAL_MS);

      // Handle client disconnect
      return () => {
        clearInterval(interval);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
