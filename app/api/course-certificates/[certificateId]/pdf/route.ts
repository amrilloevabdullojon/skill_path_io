import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateCertificatePdf } from "@/lib/server/certificate-pdf";

export const runtime = "nodejs";

function safeFileName(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
}

type RouteParams = {
  params: Promise<{
    certificateId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { certificateId: rawCertificateId } = await params;
  const certificateId = rawCertificateId?.trim();
  if (!certificateId) {
    return NextResponse.json({ error: "Missing certificateId." }, { status: 400 });
  }

  const certificate = await prisma.courseCertificate.findUnique({
    where: { id: certificateId },
    select: {
      id: true,
      issuedAt: true,
      user: {
        select: {
          name: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  }

  const bytes = await generateCertificatePdf({
    certificateId: certificate.id,
    studentName: certificate.user.name,
    trackTitle: certificate.course.title,
    issuedAt: certificate.issuedAt,
  });

  const filename = safeFileName(`certificate-${certificate.course.title}-${certificate.id}.pdf`);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
