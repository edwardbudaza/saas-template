import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { env } from "~/env";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits?: number;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  // Fix: Use AUTH_SECRET instead of NEXTAUTH_SECRET
  secret:
    env.AUTH_SECRET ||
    (env.NODE_ENV === "development"
      ? "development-secret-key-change-in-production"
      : undefined),
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    signUp: "/signup",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      console.log("🔧 JWT Callback triggered:", {
        trigger,
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account,
        tokenId: token?.id,
        userId: user?.id,
        accountProvider: account?.provider,
      });

      if (user) {
        console.log("👤 User found in JWT callback:", {
          id: user.id,
          email: user.email,
          name: user.name,
        });
        token.id = user.id;
      }

      if (account?.provider === "google" && user?.email) {
        console.log(
          "🔍 Google provider - checking existing user for:",
          user.email,
        );

        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            console.log("✅ Found existing Google user:", {
              id: existingUser.id,
              credits: existingUser.credits,
            });
            token.id = existingUser.id;
            token.credits = existingUser.credits;
          } else {
            console.log(
              "⚠️ No existing user found for Google email:",
              user.email,
            );
          }
        } catch (error) {
          console.error(
            "❌ Error finding existing user in JWT callback:",
            error,
          );
        }
      }

      console.log("🎫 Final JWT token:", {
        id: token.id,
        email: token.email,
        credits: token.credits,
      });

      return token;
    },
    async session({ session, token }) {
      console.log("🔐 Session callback triggered:", {
        hasSession: !!session,
        hasToken: !!token,
        tokenId: token?.id,
        sessionUserId: session?.user?.id,
      });

      if (token?.id) {
        session.user.id = token.id as string;

        console.log("🔍 Fetching user credits for ID:", token.id);

        try {
          const user = await db.user.findUnique({
            where: { id: token.id as string },
            select: { credits: true },
          });

          if (user) {
            console.log("💰 User credits found:", user.credits);
            session.user.credits = user.credits;
          } else {
            console.log("⚠️ No user found for ID:", token.id);
          }
        } catch (error) {
          console.error("❌ Error fetching user credits:", error);
        }
      }

      console.log("📋 Final session:", {
        userId: session.user.id,
        userEmail: session.user.email,
        userCredits: session.user.credits,
      });

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("🚪 SignIn event triggered:", {
        provider: account?.provider,
        userEmail: user?.email,
        userName: user?.name,
        hasProfile: !!profile,
      });

      if (account?.provider === "google" && user?.email) {
        console.log("🔍 Google sign-in - processing user:", user.email);

        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            console.log("✅ Updating existing Google user:", existingUser.id);

            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
              },
            });

            console.log("✅ Google user updated successfully");
          } else {
            console.log("➕ Creating new Google user");

            const newUser = await db.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                image: user.image || "",
                emailVerified: new Date(),
                credits: 3,
              },
            });

            console.log("✅ New Google user created:", {
              id: newUser.id,
              email: newUser.email,
              credits: newUser.credits,
            });
          }
        } catch (error) {
          console.error("❌ Error during Google sign in event:", error);
        }
      }
    },
    async createUser({ user }) {
      console.log("👤 CreateUser event - New user created:", {
        id: user.id,
        email: user.email,
        name: user.name,
      });
    },
  },
  debug: env.NODE_ENV === "development",
} satisfies NextAuthConfig;

// Add debug logging for the secret
console.log("🔑 Auth config initialized:", {
  hasSecret: !!authConfig.secret,
  secretLength: authConfig.secret?.length || 0,
  secretPreview: authConfig.secret
    ? authConfig.secret.substring(0, 10) + "..."
    : "undefined",
  nodeEnv: env.NODE_ENV,
  authSecretFromEnv: !!env.AUTH_SECRET,
});
