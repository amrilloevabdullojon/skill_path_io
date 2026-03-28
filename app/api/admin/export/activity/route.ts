import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function escape(v: string | null | undefined): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const email =
    typeof session?.user?.email === "string" ? session.user.email : null;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the requesting user is an admin
  const requestingUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (requestingUser?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const from = fromParam ? new Date(fromParam) : null;
  const to = toParam ? new Date(toParam) : null;

  const where = {
    ...(from || to
      ? {
          timestamp: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };

  const logs = await prisma.adminActivityLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 10000,
  });

  const header = "id,actorEmail,actorRole,action,entityType,entityId,note,timestamp\n";
  const rows = logs.map((log) =>
    [
      escape(log.id),
      escape(log.actorEmail),
      escape(log.actorRole),
      escape(log.action),
      escape(log.entityType),
      escape(log.entityId),
      escape(log.note),
      escape(log.timestamp.toISOString()),
    ].join(","),
  );

  const csv = header + rows.join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="activity-log-${date}.csv"`,
    },
  });
}
