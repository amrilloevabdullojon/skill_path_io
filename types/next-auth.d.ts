import { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

export type AppRoleEnum = "ADMIN" | "STUDENT" | "PRO_STUDENT" | "MENTOR" | "RECRUITER";

declare module "next-auth" {
  interface User {
    role?: AppRoleEnum;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: AppRoleEnum;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRoleEnum;
  }
}
