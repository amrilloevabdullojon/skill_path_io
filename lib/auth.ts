import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getLocalUserByEmail } from "@/lib/auth/local-users";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Local Demo Access",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Guard: demo credentials require the expected demo password token.
        // The local login panel always sends password: "local"; any other value
        // (including missing/empty) must be rejected to prevent account enumeration.
        if (credentials?.password !== "local") {
          return null;
        }

        const user = getLocalUserByEmail(credentials?.email);
        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name ?? "SkillPath User";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "STUDENT";
      }
      return session;
    },
  },
  // Do not provide a fallback — if NEXTAUTH_SECRET is missing, NextAuth will
  // refuse to start rather than silently sign tokens with a known weak key.
  // validateEnv() in lib/env.ts already ensures this var is set at startup.
  secret: process.env.NEXTAUTH_SECRET,
};
