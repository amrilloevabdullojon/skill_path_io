import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function escape(v: string | null | undefined): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
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
