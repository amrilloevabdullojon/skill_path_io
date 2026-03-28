import { AdminPermission } from "@/types/admin/permissions";

export type StudioAdminLink = {
  href: string;
  label: string;
  permission: AdminPermission;
};

export const studioAdminLinks: StudioAdminLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", permission: "courses.read" },
  { href: "/admin/courses", label: "Courses", permission: "courses.read" },
  { href: "/admin/modules", label: "Modules", permission: "courses.read" },
  { href: "/admin/lessons", label: "Lessons", permission: "courses.read" },
  { href: "/admin/quizzes", label: "Quizzes", permission: "courses.read" },
  { href: "/admin/assignments", label: "Assignments", permission: "courses.read" },
  { href: "/admin/simulations", label: "Simulations", permission: "courses.read" },
  { href: "/admin/cases", label: "Cases", permission: "courses.read" },
  { href: "/admin/templates", label: "Templates", permission: "templates.manage" },
  { href: "/admin/media", label: "Media", permission: "media.manage" },
  { href: "/admin/users", label: "Users", permission: "users.manage" },
  { href: "/admin/analytics", label: "Analytics", permission: "analytics.read" },
  { href: "/admin/certificates", label: "Certificates", permission: "certificates.manage" },
  { href: "/admin/settings", label: "Settings", permission: "settings.manage" },
  { href: "/admin/tracks", label: "Legacy Tracks", permission: "courses.read" },
  { href: "/admin/permissions", label: "Permissions", permission: "users.manage" },
  { href: "/admin/audit-log", label: "Audit Log", permission: "analytics.read" },
  { href: "/admin/activity", label: "Activity Log", permission: "analytics.read" },
];
