import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { verifyCredentials } from "@/lib/auth/credentials";
import { getLocalUserByEmail } from "@/lib/auth/local-users";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import { prisma } from "@/lib/prisma";
import type { AppRoleEnum } from "@/types/next-auth";

// OAuth providers are enabled only when their credentials are configured, so
// local/demo deployments work without them.
const oauthProviders: NextAuthOptions["providers"] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  oauthProviders.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...oauthProviders,
    CredentialsProvider({
      name: "Local Demo Access",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Unified verification: demo accounts (demo mode + "local" token) and
        // real accounts (bcrypt password hash) are both handled here.
        const identity = await verifyCredentials(credentials.email, credentials.password);
        if (!identity) {
          return null;
        }

        return {
          id: identity.id,
          email: identity.email,
          role: identity.role,
        };
      },
    }),
  ],
  callbacks: {
    // On OAuth sign-in, upsert a real user (JWT strategy has no DB adapter).
    // Email is provider-verified, so mark it verified. The jwt callback then
    // syncs id/role from this row.
    async signIn({ user, account }) {
      if (account && account.provider !== "credentials" && user.email) {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
              email: user.email,
              name: user.name ?? user.email,
              role: "STUDENT",
              emailVerified: new Date(),
            },
          });
        } catch {
          // Don't block sign-in on a DB hiccup; jwt callback falls back.
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // First sign in
      if (user && "role" in user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Always sync the token role from the DB for subsequent calls
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          } else if (!token.id) {
            // Fallback for old cookies
            const localUser = isDemoModeEnabled() ? getLocalUserByEmail(token.email) : null;
            if (localUser) {
              token.id = localUser.id;
              token.role = localUser.role;
            }
          }
        } catch {
          // ignore DB connection errors gracefully during JWT generation
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name ?? "Levio User";
        session.user.role = (token.role as AppRoleEnum | undefined) ?? "STUDENT";
        session.user.id = (token.id as string) || "local-student"; // Fallback to never be undefined
      }
      return session;
    },
  },
  // Do not provide a fallback — if NEXTAUTH_SECRET is missing, NextAuth will
  // refuse to start rather than silently sign tokens with a known weak key.
  // validateEnv() in lib/env.ts already ensures this var is set at startup.
  secret: process.env.NEXTAUTH_SECRET,
};
