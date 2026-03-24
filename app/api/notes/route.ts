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

  const notes = await prisma.userNote.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 120,
  });

  return NextResponse.json({ notes }, { status: 200 });
}

export async function POST(request: Request) {
  const user = await resolveRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    content?: string;
    lessonRef?: string;
    track?: "QA" | "BA" | "DA";
  };

  const title = body.title?.trim() ?? "";
  const content = body.content?.trim() ?? "";
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required." }, { status: 400 });
  }

  const track = body.track === "BA" || body.track === "DA" ? body.track : "QA";
  const lessonRef = body.lessonRef?.trim() || "Manual note";
  const created = await prisma.userNote.create({
    data: {
      userId: user.id,
      title,
      content,
      moduleRef: `track:${track}`,
      lessonRef,
    },
  });

  return NextResponse.json({ note: created }, { status: 201 });
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

  await prisma.userNote.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
