import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type CertificatePdfInput = {
  certificateId: string;
  studentName: string;
  trackTitle: string;
  issuedAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export async function generateCertificatePdf({
  certificateId,
  studentName,
  trackTitle,
  issuedAt,
}: CertificatePdfInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([1120, 790]);
  const width = page.getWidth();
  const height = page.getHeight();

  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Deep Midnight Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.02, 0.04, 0.08),
  });

  // Outer Neon Grid Border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.05, 0.65, 0.85), // Cyan neon line
    borderWidth: 1,
  });

  // Inner Elegant Border
  page.drawRectangle({
    x: 45,
    y: 45,
    width: width - 90,
    height: height - 90,
    borderColor: rgb(0.15, 0.25, 0.4),
    borderWidth: 1,
  });

  page.drawText("Levio", {
    x: 90,
    y: height - 120,
    size: 28,
    font: boldFont,
    color: rgb(0.4, 0.6, 0.9), // Soft blue
  });

  page.drawText("CERTIFICATE OF COMPLETION", {
    x: 90,
    y: height - 180,
    size: 42,
    font: boldFont,
    color: rgb(1, 1, 1), // Pure white
  });

  page.drawText("This certificate is proudly awarded to", {
    x: 90,
    y: height - 250,
    size: 22,
    font: regularFont,
    color: rgb(0.76, 0.83, 0.93),
  });

  page.drawText(studentName, {
    x: 90,
    y: height - 305,
    size: 52,
    font: boldFont,
    color: rgb(0.05, 0.85, 0.65), // Emerald Neon
  });

  page.drawText("for successful completion of the learning track:", {
    x: 90,
    y: height - 365,
    size: 18,
    font: regularFont,
    color: rgb(0.6, 0.7, 0.8),
  });

  page.drawText(trackTitle, {
    x: 90,
    y: height - 425,
    size: 32,
    font: boldFont,
    color: rgb(0.9, 0.8, 0.4), // Golden Amber
  });

  // Neon divider
  page.drawRectangle({
    x: 90,
    y: Math.floor(height) - 480,
    width: 120,
    height: 4,
    color: rgb(0.05, 0.65, 0.85),
  });

  page.drawLine({
    start: { x: 90, y: 150 },
    end: { x: width - 90, y: 150 },
    thickness: 1,
    color: rgb(0.15, 0.25, 0.4),
  });

  page.drawText(`Issued: ${formatDate(issuedAt)}`, {
    x: 90,
    y: 128,
    size: 15,
    font: regularFont,
    color: rgb(0.73, 0.8, 0.9),
  });

  page.drawText(`Certificate ID: ${certificateId}`, {
    x: 90,
    y: 104,
    size: 14,
    font: regularFont,
    color: rgb(0.58, 0.66, 0.76),
  });

  return pdf.save();
}
