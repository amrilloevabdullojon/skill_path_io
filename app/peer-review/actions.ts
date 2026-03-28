"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitPeerReviewAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const submissionId = formData.get("submissionId") as string;
  const feedback = formData.get("feedback") as string;
  const clarityStr = formData.get("clarity") as string;
  const accuracyStr = formData.get("accuracy") as string;
  const completenessStr = formData.get("completeness") as string;

  if (!submissionId || !feedback?.trim()) return;

  const clarity = Math.max(0, Math.min(100, parseInt(clarityStr) || 0));
  const accuracy = Math.max(0, Math.min(100, parseInt(accuracyStr) || 0));
  const completeness = Math.max(0, Math.min(100, parseInt(completenessStr) || 0));
  const score = Math.round((clarity + accuracy + completeness) / 3);

  const reviewer = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!reviewer) return;

  try {
    await prisma.peerReview.create({
      data: {
        submissionId,
        reviewerId: reviewer.id,
        score,
        feedback: feedback.trim(),
        criteriaScores: { clarity, accuracy, completeness },
      },
    });
  } catch {
    // Duplicate review — ignore
  }

  revalidatePath("/peer-review");
  redirect("/peer-review?reviewed=1");
}
