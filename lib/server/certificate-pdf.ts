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

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.02, 0.05, 0.11),
  });

  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: rgb(0.22, 0.39, 0.78),
    borderWidth: 2,
  });

  page.drawText("SkillPath Academy", {
    x: 90,
    y: height - 120,
    size: 32,
    font: boldFont,
    color: rgb(0.74, 0.85, 1),
  });

  page.drawText("Certificate of Completion", {
    x: 90,
    y: height - 180,
    size: 46,
    font: boldFont,
    color: rgb(0.95, 0.97, 1),
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
    size: 48,
    font: boldFont,
    color: rgb(0.59, 0.84, 0.96),
  });

  page.drawText("for successful completion of the learning track", {
    x: 90,
    y: height - 360,
    size: 21,
    font: regularFont,
    color: rgb(0.76, 0.83, 0.93),
  });

  page.drawText(trackTitle, {
    x: 90,
    y: height - 415,
    size: 36,
    font: boldFont,
    color: rgb(0.96, 0.88, 0.56),
  });

  page.drawLine({
    start: { x: 90, y: 160 },
    end: { x: width - 90, y: 160 },
    thickness: 1,
    color: rgb(0.19, 0.27, 0.39),
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
