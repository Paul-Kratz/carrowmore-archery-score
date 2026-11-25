import NextAuth, { type NextAuthConfig } from "next-auth";
import type { NextRequest } from "next/server";
import Resend from "next-auth/providers/resend";
import { sendSignInEmail } from "./email/sendSignInEmail";

jest.mock("next-auth", () => ({ __esModule: true, default: jest.fn(() => ({})) }));
jest.mock("next-auth/providers/google", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("next-auth/providers/resend", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@auth/mongodb-adapter", () => ({ MongoDBAdapter: jest.fn() }), { virtual: true });
jest.mock("./db", () => ({ __esModule: true, default: {} }));

import "./auth";

const config = jest.mocked(NextAuth).mock.calls[0][0] as NextAuthConfig;

it("wires the branded email sender into the existing Resend provider", () => {
  expect(Resend).toHaveBeenCalledWith({
    from: process.env.AUTH_EMAIL,
    sendVerificationRequest: sendSignInEmail,
  });
});

it("configures all default entry/error/confirmation surfaces to use the custom pages", () => {
  expect(config.pages).toEqual({ signIn: "/login", error: "/login", verifyRequest: "/login/check-email" });
});

it.each([
  ["/login", true], ["/login/check-email", true], ["/", false],
  ["/history", false], ["/shoot/123/1", false], ["/login/private", false],
])("authorizes unauthenticated requests to %s: %s", async (path, allowed) => {
  const result = await config.callbacks!.authorized!({
    auth: null, request: { url: `http://localhost${path}` } as NextRequest,
  });
  expect(result).toBe(allowed);
});

it("still authorizes a signed-in archer to view their shoot", async () => {
  expect(await config.callbacks!.authorized!({
    auth: { user: { id: "archer-1" }, expires: "2099-01-01" },
    request: { url: "http://localhost/shoot/123/1" } as NextRequest,
  })).toBe(true);
});
