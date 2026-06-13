"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { callAnthropic } from "@/lib/ai/ai-service";

function parseSlider(value: FormDataEntryValue | null): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export async function submitPeerReviewAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const submissionId = formData.get("submissionId");
  const feedback = formData.get("feedback");
  if (typeof submissionId !== "string" || !submissionId) {
    throw new Error("Missing submissionId");
  }
  if (typeof feedback !== "string" || feedback.trim().length < 50) {
    throw new Error("Feedback must be at least 50 characters");
  }

  const reviewerId = session.user.id;

  const target = await prisma.missionSubmission.findUnique({
    where: { id: submissionId },
    select: { userId: true },
  });
  if (!target) throw new Error("Submission not found");
  if (target.userId === reviewerId) throw new Error("Cannot review your own submission");

  const clarity = parseSlider(formData.get("clarity"));
  const accuracy = parseSlider(formData.get("accuracy"));
  const completeness = parseSlider(formData.get("completeness"));
  const score = Math.round((clarity + accuracy + completeness) / 3);

  await prisma.peerReview.upsert({
    where: {
      submissionId_reviewerId: { submissionId, reviewerId },
    },
    update: {
      score,
      feedback,
      criteriaScores: { clarity, accuracy, completeness },
    },
    create: {
      submissionId,
      reviewerId,
      score,
      feedback,
      criteriaScores: { clarity, accuracy, completeness },
    },
  });

  redirect("/peer-review?reviewed=1");
}

export async function savePeerReview(submissionId: string, isApproved: boolean) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const reviewerId = session.user.id;

    // Don't allow reviewing own submission
    const targetSubmission = await prisma.missionSubmission.findUnique({
      where: { id: submissionId },
      select: { userId: true }
    });

    if (!targetSubmission) {
      throw new Error("Submission not found");
    }

    if (targetSubmission.userId === reviewerId) {
      throw new Error("Cannot review your own submission");
    }

    const score = isApproved ? 100 : 0;
    const feedbackText = isApproved 
      ? "Одобрено (Code Tinder: Swipe Right)" 
      : "Требуется доработка (Code Tinder: Swipe Left)";

    // Upsert to handle multiple accidental swipes gracefully (won't throw unique constraint)
    const review = await prisma.peerReview.upsert({
      where: {
        submissionId_reviewerId: {
          submissionId,
          reviewerId
        }
      },
      update: {
        score,
        feedback: feedbackText
      },
      create: {
        submissionId,
        reviewerId,
        score,
        feedback: feedbackText,
        criteriaScores: { gamified: true }
      }
    });

    // --- GAMIFICATION: Auto-promote to MENTOR if review limit reached ---
    const reviewCount = await prisma.peerReview.count({
      where: { reviewerId }
    });

    let promoted = false;
    if (reviewCount >= 5) {
      const user = await prisma.user.findUnique({ where: { id: reviewerId }, select: { role: true } });
      if (user && (user.role === UserRole.STUDENT || user.role === UserRole.PRO_STUDENT)) {
        await prisma.user.update({
          where: { id: reviewerId },
          data: { role: UserRole.MENTOR }
        });
        promoted = true;
      }
    }

    return { success: true, reviewId: review.id, promoted, reviewCount };

  } catch (error) {
    console.error("Failed to save peer review:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function askAiReview(code: string, missionTitle: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    // Use session role to support both Prisma users and Local Mock users
    const role = session.user.role;
    if (role !== "MENTOR" && role !== "PRO_STUDENT" && role !== "ADMIN") {
      throw new Error("AI Mentor is only available for Pro Students and Mentors");
    }

    const prompt = `
      You are an expert Senior Developer reviewing code for a junior developer.
      Mission Title: "${missionTitle}"
      Submitted Code/Answer:
      """
      ${code}
      """

      Evaluate the code concisely (max 3 sentences).
      Determine if it passes basic quality gates. 
      End your response exactly with "VERDICT: APPROVE" or "VERDICT: REJECT".
    `;

    const aiRes = await callAnthropic({
      systemPrompt: prompt,
      messages: [{ role: "user", content: "Please evaluate the submission." }],
      maxTokens: 500,
      temperature: 0.2
    });
    
    if (!aiRes.ok) {
      throw new Error(aiRes.error);
    }
    
    const responseText = aiRes.data;
    
    const verdictMatch = responseText.match(/VERDICT:\s*(APPROVE|REJECT)/i);
    const isApproved = verdictMatch ? verdictMatch[1].toUpperCase() === "APPROVE" : true;
    const comment = responseText.replace(/VERDICT:\s*(APPROVE|REJECT)/i, "").trim() || "LGTM";

    // Telemetry log
    await prisma.aiUsageLog.create({
      data: {
        feature: "CODE_TINDER_AI",
        userId: session.user.id,
      }
    }).catch(() => null);

    return { success: true, isApproved, comment };

  } catch (error) {
    console.error("AI Review failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message || "AI Mentor is currently unavailable." };
  }
}
