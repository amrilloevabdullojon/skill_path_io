import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveRequestUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return null;
  }
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
}

export async function GET() {
  const user = await resolveRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.userBookmark.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 120,
  });

  return NextResponse.json({ bookmarks }, { status: 200 });
}

export async function POST(request: Request) {
  const user = await resolveRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    href?: string;
    type?: "lesson" | "module" | "quiz" | "mission";
    tag?: string;
  };

  const title = body.title?.trim() ?? "";
  const href = body.href?.trim() ?? "";
  if (!title || !href) {
    return NextResponse.json({ error: "title and href are required." }, { status: 400 });
  }

  const type =
    body.type === "module" || body.type === "quiz" || body.type === "mission"
      ? body.type
      : "lesson";
  const tag = body.tag?.trim() || "General";

  const existing = await prisma.userBookmark.findFirst({
    where: {
      userId: user.id,
      title,
      href,
    },
  });

  if (existing) {
    return NextResponse.json({ bookmark: existing }, { status: 200 });
  }

  const created = await prisma.userBookmark.create({
    data: {
      userId: user.id,
      title,
      href,
      type,
      tag,
    },
  });

  return NextResponse.json({ bookmark: created }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await resolveRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  await prisma.userBookmark.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
