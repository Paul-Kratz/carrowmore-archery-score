import NextAuth, { type NextAuthConfig } from "next-auth";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

jest.mock("next-auth", () => ({ __esModule: true, default: jest.fn(() => ({})) }));
jest.mock("next-auth/providers/google", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("next-auth/providers/resend", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@auth/mongodb-adapter", () => ({ MongoDBAdapter: jest.fn() }), { virtual: true });
jest.mock("./db", () => ({ __esModule: true, default: {} }));

import "./auth";

const config = jest.mocked(NextAuth).mock.calls[0][0] as NextAuthConfig;
const authorize = (auth: unknown) => config.callbacks!.authorized!({
  auth: auth as Session | null,
  request: { url: "https://example.com/history" } as NextRequest,
});

it.each([
  null,
  {},
  { message: "There was a problem with the server configuration." },
  { user: null },
  { user: {} },
  { user: { id: "" } },
  { user: { id: "   " } },
  { user: { id: 123 } },
])("denies absent, malformed or configuration-error sessions: %j", async (session) => {
  expect(await authorize(session)).toBe(false);
});

it("allows a valid signed-in archer", async () => {
  expect(await authorize({ user: { id: "archer-1" }, expires: "2099-01-01" })).toBe(true);
});
