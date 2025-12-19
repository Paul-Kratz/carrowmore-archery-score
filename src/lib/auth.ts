import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Resend from "next-auth/providers/resend";
import { ROUTES } from "@/constants/routes";

const publicRoutes: string[] = [ROUTES.HOME, ROUTES.VERIFY_REQUEST];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, Resend({ from: process.env.AUTH_EMAIL })],
  pages: {
    verifyRequest: ROUTES.VERIFY_REQUEST,
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      const pathname = new URL(request.url).pathname;

      // Allow unauthenticated access to public routes only
      if (publicRoutes.includes(pathname)) {
        return true;
      }

      // Require authentication for all other routes
      return !!auth;
    },
  },
});
