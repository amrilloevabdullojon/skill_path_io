import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { MAX_EXPORT_USER_ROWS } from "@/lib/config/limits";
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

export async function GET() {
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

  const users = await prisma.user.findMany({
    // Safety cap: avoids unbounded full-table scans in large DBs.
    // For exports beyond this size, use DB-level tooling or add cursor pagination.
    take: MAX_EXPORT_USER_ROWS,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const header = "id,email,name,role,createdAt\n";
  const rows = users.map((u) =>
    [
      escape(u.id),
      escape(u.email),
      escape(u.name),
      escape(u.role),
      escape(u.createdAt.toISOString()),
    ].join(","),
  );

  const csv = header + rows.join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users-${date}.csv"`,
    },
  });
}
