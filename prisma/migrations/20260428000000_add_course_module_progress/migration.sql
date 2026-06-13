-- Add user progress support for Studio CourseModule records.
CREATE TABLE "CourseModuleProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseModuleId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModuleProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseModuleProgress_userId_courseModuleId_key" ON "CourseModuleProgress"("userId", "courseModuleId");
CREATE INDEX "CourseModuleProgress_userId_idx" ON "CourseModuleProgress"("userId");
CREATE INDEX "CourseModuleProgress_courseModuleId_idx" ON "CourseModuleProgress"("courseModuleId");
CREATE INDEX "CourseModuleProgress_status_idx" ON "CourseModuleProgress"("status");

ALTER TABLE "CourseModuleProgress"
ADD CONSTRAINT "CourseModuleProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseModuleProgress"
ADD CONSTRAINT "CourseModuleProgress_courseModuleId_fkey"
FOREIGN KEY ("courseModuleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
