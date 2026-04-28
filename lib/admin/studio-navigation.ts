import { AdminPermission } from "@/types/admin/permissions";

export type StudioAdminLink = {
  href: string;
  label: string;
  permission: AdminPermission;
};

export const studioAdminLinks: StudioAdminLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", permission: "courses.read" },
  { href: "/admin/courses", label: "Courses", permission: "courses.read" },
  { href: "/admin/users", label: "Users", permission: "users.manage" },
  { href: "/admin/certificates", label: "Certificates", permission: "certificates.manage" },
  { href: "/admin/analytics", label: "Analytics", permission: "analytics.read" },
  { href: "/admin/settings", label: "Settings", permission: "settings.manage" },
];
