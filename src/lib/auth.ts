import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./db";

const publicRoutes: string[] = [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  trustHost: true,
  providers: [Google, Resend({ from: process.env.AUTH_EMAIL })],
  pages: {
    // verifyRequest: ROUTES.VERIFY_REQUEST,
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
