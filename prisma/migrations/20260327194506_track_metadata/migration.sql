/*
  Warnings:

  - Added the required column `updatedAt` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "careerImpact" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estimatedWeeks" INTEGER,
ADD COLUMN     "learningOutcomes" TEXT[],
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "status" "TrackStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Track_category_idx" ON "Track"("category");

-- CreateIndex
CREATE INDEX "Track_status_idx" ON "Track"("status");
