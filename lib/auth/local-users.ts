export type LocalUserRole = "ADMIN" | "STUDENT";

export type LocalAuthUser = {
  id: string;
  email: string;
  name: string;
  role: LocalUserRole;
  redirectPath: string;
};

const LOCAL_USERS: LocalAuthUser[] = [
  {
    id: "local-admin",
    email: "admin@skillpath.local",
    name: "SkillPath Admin",
    role: "ADMIN",
    redirectPath: "/admin",
  },
  {
    id: "local-student",
    email: "student@skillpath.local",
    name: "Demo Student",
    role: "STUDENT",
    redirectPath: "/dashboard",
  },
];

export function getLocalAuthUsers() {
  return LOCAL_USERS;
}

export function getLocalUserByEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return LOCAL_USERS.find((user) => user.email === normalizedEmail) ?? null;
}

export function getLocalUserByRole(role: LocalUserRole) {
  return LOCAL_USERS.find((user) => user.role === role) ?? null;
}
