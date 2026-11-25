import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./db";
import { authPages, isPublicAuthPath } from "./authPages";
import { sendSignInEmail } from "./email/sendSignInEmail";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  trustHost: true,
  providers: [Google, Resend({
    from: process.env.AUTH_EMAIL,
    sendVerificationRequest: sendSignInEmail,
  })],
  pages: authPages,
  callbacks: {
    authorized: async ({ auth, request }) => {
      const pathname = new URL(request.url).pathname;

      // Allow unauthenticated access to public routes only
      if (isPublicAuthPath(pathname)) {
        return true;
      }

      // Require authentication for all other routes
      return !!auth;
    },
  },
});
