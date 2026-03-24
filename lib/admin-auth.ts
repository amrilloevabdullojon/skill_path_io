import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PermissionRoleType, UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { hasAdminPermission, resolveAdminRole } from "@/lib/permissions/admin-permissions";
import { prisma } from "@/lib/prisma";
import { AdminPermission, AdminRole } from "@/types/admin/permissions";

type AdminContext = {
  email: string | null;
  name: string | null;
  source: "session" | "local-demo";
  adminRole: AdminRole;
};

function mapPermissionRoleToAdminRole(role: PermissionRoleType): AdminRole {
  if (role === PermissionRoleType.SUPER_ADMIN) return "SUPER_ADMIN";
  if (role === PermissionRoleType.CONTENT_ADMIN) return "CONTENT_ADMIN";
  if (role === PermissionRoleType.COURSE_EDITOR) return "COURSE_EDITOR";
  if (role === PermissionRoleType.REVIEWER) return "REVIEWER";
  return "ANALYTICS_MANAGER";
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const session = await getServerSession(authOptions);
  const sessionEmail = typeof session?.user?.email === "string" ? session.user.email : null;
  if (!sessionEmail) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: sessionEmail },
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  let adminRole = resolveAdminRole(user.email);
  try {
    const dbPermissionRole = await prisma.permissionRole.findUnique({
      where: { email: sessionEmail },
      select: {
        role: true,
        isActive: true,
      },
    });

    if (dbPermissionRole?.isActive) {
      adminRole = mapPermissionRoleToAdminRole(dbPermissionRole.role);
    }
  } catch {
    // Keep local fallback role mapping when DB role table is unavailable in local mode.
  }

  return {
    email: user.email,
    name: user.name,
    source: "session",
    adminRole,
  };
}

export async function requireAdminRoute() {
  const admin = await getAdminContext();

  if (!admin) {
    redirect("/login");
  }

  return admin;
}

export async function requireAdminAction() {
  const admin = await getAdminContext();

  if (!admin) {
    throw new Error("FORBIDDEN");
  }

  return admin;
}

export async function requireAdminPermission(permission: AdminPermission) {
  const admin = await requireAdminAction();
  if (!hasAdminPermission(admin.adminRole, permission)) {
    throw new Error("FORBIDDEN_PERMISSION");
  }
  return admin;
}
