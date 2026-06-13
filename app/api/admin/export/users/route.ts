import { NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/auth/server-verify";
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
  const authError = await verifyAdminAccess();
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
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
      _count: {
        select: {
          certificates: true,
          courseCertificates: true,
        },
      },
    },
  });

  const header = "id,email,name,role,createdAt,trackCertificates,courseCertificates,totalCertificates\n";
  const rows = users.map((u) =>
    [
      escape(u.id),
      escape(u.email),
      escape(u.name),
      escape(u.role),
      escape(u.createdAt.toISOString()),
      escape(String(u._count.certificates)),
      escape(String(u._count.courseCertificates)),
      escape(String(u._count.certificates + u._count.courseCertificates)),
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
