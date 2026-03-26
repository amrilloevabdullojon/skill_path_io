-- CreateIndex
CREATE INDEX "AdminActivityLog_actorEmail_idx" ON "AdminActivityLog"("actorEmail");

-- CreateIndex
CREATE INDEX "AdminActivityLog_timestamp_idx" ON "AdminActivityLog"("timestamp");

-- CreateIndex
CREATE INDEX "AdminActivityLog_entityType_entityId_idx" ON "AdminActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CareerGoal_userId_idx" ON "CareerGoal"("userId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "CourseAnalyticsSnapshot_courseId_idx" ON "CourseAnalyticsSnapshot"("courseId");

-- CreateIndex
CREATE INDEX "CourseAnalyticsSnapshot_capturedAt_idx" ON "CourseAnalyticsSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "DiscussionComment_threadId_idx" ON "DiscussionComment"("threadId");

-- CreateIndex
CREATE INDEX "DiscussionComment_userId_idx" ON "DiscussionComment"("userId");

-- CreateIndex
CREATE INDEX "DiscussionThread_userId_idx" ON "DiscussionThread"("userId");

-- CreateIndex
CREATE INDEX "DiscussionThread_track_idx" ON "DiscussionThread"("track");

-- CreateIndex
CREATE INDEX "DiscussionThread_createdAt_idx" ON "DiscussionThread"("createdAt");

-- CreateIndex
CREATE INDEX "LearningPlan_userId_status_idx" ON "LearningPlan"("userId", "status");

-- CreateIndex
CREATE INDEX "ReadinessScoreSnapshot_userId_capturedAt_idx" ON "ReadinessScoreSnapshot"("userId", "capturedAt");

-- CreateIndex
CREATE INDEX "ReadinessScoreSnapshot_targetRole_idx" ON "ReadinessScoreSnapshot"("targetRole");

-- CreateIndex
CREATE INDEX "SkillGapSnapshot_userId_capturedAt_idx" ON "SkillGapSnapshot"("userId", "capturedAt");

-- CreateIndex
CREATE INDEX "UserNote_userId_idx" ON "UserNote"("userId");

-- CreateIndex
CREATE INDEX "UserProgress_userId_idx" ON "UserProgress"("userId");

-- CreateIndex
CREATE INDEX "UserProgress_status_idx" ON "UserProgress"("status");
