import type { Metadata } from "next";

import { MockInterviewPanel } from "@/components/interview/mock-interview-panel";

export const metadata: Metadata = {
  title: "Mock Interview",
  description: "Practice job interview scenarios with AI feedback tailored to your QA, BA, or DA track.",
};

export default function InterviewPage() {
  return (
    <section className="page-shell">
      <MockInterviewPanel />
    </section>
  );
}
