import { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "STUDENT";
  }

  interface Session {
    user: DefaultSession["user"] & {
      role?: "ADMIN" | "STUDENT";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "STUDENT";
  }
}
