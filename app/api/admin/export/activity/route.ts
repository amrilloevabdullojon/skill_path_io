import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/auth/server-verify";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function escape(v: string | null | undefined): string {
  let str = String(v ?? "");
  // Prevent CSV formula injection: Excel / Google Sheets treat cells starting
  // with =, +, -, @, \t, \r as formulas. Prefix with a single quote to neutralise.
  if (str.length > 0 && /^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const authError = await verifyAdminAccess();
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
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
