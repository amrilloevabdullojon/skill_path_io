import type { Metadata } from "next";

import { SqlSandboxPanel } from "@/components/simulation/sql-sandbox-panel";

export const metadata: Metadata = {
  title: "SQL Sandbox — SkillPath Academy",
  description: "Practice SQL queries in a live in-browser sandbox environment.",
};

export default function SqlSandboxPage() {
  return <SqlSandboxPanel />;
}
