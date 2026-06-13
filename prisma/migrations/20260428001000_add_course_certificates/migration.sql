-- Add certificates for Studio Course records without changing legacy Track certificates.
CREATE TABLE "CourseCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT NOT NULL,

    CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseCertificate_userId_courseId_key" ON "CourseCertificate"("userId", "courseId");
CREATE INDEX "CourseCertificate_userId_idx" ON "CourseCertificate"("userId");
CREATE INDEX "CourseCertificate_courseId_idx" ON "CourseCertificate"("courseId");

ALTER TABLE "CourseCertificate"
ADD CONSTRAINT "CourseCertificate_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseCertificate"
ADD CONSTRAINT "CourseCertificate_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
