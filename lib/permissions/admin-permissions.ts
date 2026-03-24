import { AdminPermission, AdminRole } from "@/types/admin/permissions";

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "courses.read",
    "courses.write",
    "courses.publish",
    "builder.write",
    "templates.manage",
    "media.manage",
    "certificates.manage",
    "users.manage",
    "analytics.read",
    "settings.manage",
  ],
  CONTENT_ADMIN: [
    "courses.read",
    "courses.write",
    "builder.write",
    "templates.manage",
    "media.manage",
    "certificates.manage",
    "analytics.read",
  ],
  COURSE_EDITOR: ["courses.read", "courses.write", "builder.write", "media.manage"],
  REVIEWER: ["courses.read", "courses.publish", "analytics.read"],
  ANALYTICS_MANAGER: ["courses.read", "analytics.read"],
};

const defaultLocalAdminRoleMap: Record<string, AdminRole> = {
  "admin@skillpath.local": "SUPER_ADMIN",
  "content.admin@skillpath.local": "CONTENT_ADMIN",
  "editor@skillpath.local": "COURSE_EDITOR",
  "reviewer@skillpath.local": "REVIEWER",
  "analytics@skillpath.local": "ANALYTICS_MANAGER",
};

function parseLocalAdminRoleOverrides() {
  const raw = process.env.LOCAL_ADMIN_ROLE_OVERRIDES;
  if (!raw) {
    return {};
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, AdminRole>>((acc, item) => {
      const [emailPart, rolePart] = item.split(":").map((value) => value?.trim().toUpperCase());
      if (!emailPart || !rolePart) {
        return acc;
      }

      if (
        rolePart === "SUPER_ADMIN" ||
        rolePart === "CONTENT_ADMIN" ||
        rolePart === "COURSE_EDITOR" ||
        rolePart === "REVIEWER" ||
        rolePart === "ANALYTICS_MANAGER"
      ) {
        acc[emailPart.toLowerCase()] = rolePart;
      }
      return acc;
    }, {});
}

function localAdminRoleMap() {
  return {
    ...defaultLocalAdminRoleMap,
    ...parseLocalAdminRoleOverrides(),
  };
}

export function getRolePermissions(role: AdminRole) {
  return rolePermissions[role] ?? [];
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  return getRolePermissions(role).includes(permission);
}

export function resolveAdminRole(email: string | null | undefined): AdminRole {
  const normalized = (email ?? "").toLowerCase().trim();
  if (!normalized) {
    return "COURSE_EDITOR";
  }
  return localAdminRoleMap()[normalized] ?? "COURSE_EDITOR";
}
