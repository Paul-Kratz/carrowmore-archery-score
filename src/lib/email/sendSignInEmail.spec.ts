import type { EmailConfig } from "next-auth/providers";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sendSignInEmail } from "./sendSignInEmail";
import { SIGN_IN_ICON_CID, signInEmail } from "./signInEmail";

jest.mock("node:fs/promises", () => ({ readFile: jest.fn() }));
const mockReadFile = jest.mocked(readFile);
const realIcon = readFileSync(join(process.cwd(), "public/icons/icon-192.png"));

const mockFetch = jest.fn();
const originalFetch = global.fetch;
const params: Parameters<EmailConfig["sendVerificationRequest"]>[0] = {
  identifier: "archer@example.com",
  url: "https://score.example/api/auth/callback/resend?token=preview-only&callbackUrl=%2Fhistory",
  expires: new Date("2026-11-19T14:30:00Z"),
  provider: {
    id: "resend", name: "Resend", type: "email", from: "In the Forest <signin@example.com>",
    apiKey: "test-only-key", sendVerificationRequest: sendSignInEmail,
  },
  token: "preview-only",
  theme: {},
  request: new Request("https://score.example"),
};

beforeEach(() => {
  mockFetch.mockReset();
  mockReadFile.mockReset().mockResolvedValue(realIcon);
  global.fetch = mockFetch;
});
afterAll(() => { global.fetch = originalFetch; });

it("sends the generated HTML and plain text using the existing sender and recipient", async () => {
  mockFetch.mockResolvedValue({ ok: true });
  await sendSignInEmail(params);
  expect(mockFetch).toHaveBeenCalledTimes(1);
  const [endpoint, request] = mockFetch.mock.calls[0];
  expect(endpoint).toBe("https://api.resend.com/emails");
  expect(request.method).toBe("POST");
  expect(request.headers).toEqual({ Authorization: "Bearer test-only-key", "Content-Type": "application/json" });
  expect(JSON.parse(request.body)).toEqual({
    from: params.provider.from, to: params.identifier,
    ...signInEmail({ url: params.url, expires: params.expires }),
    attachments: [{
      filename: "in-the-forest.png", content_type: "image/png",
      content_id: SIGN_IN_ICON_CID, content: realIcon.toString("base64"),
    }],
  });
  expect(mockReadFile).toHaveBeenCalledWith(join(process.cwd(), "public/icons/icon-192.png"));
});

it("still sends a usable sign-in email when the icon cannot be read", async () => {
  mockReadFile.mockRejectedValue(new Error("File not found"));
  mockFetch.mockResolvedValue({ ok: true });
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    await sendSignInEmail(params);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.attachments).toBeUndefined();
    expect(body.html).not.toContain("<img");
    expect(body.html).toContain("IN THE FOREST");
    expect(body.text).toContain(params.url);
  } finally {
    warn.mockRestore();
  }
});

it("rejects provider failures without reading a potentially sensitive response body", async () => {
  const json = jest.fn();
  mockFetch.mockResolvedValue({ ok: false, status: 422, json });
  await expect(sendSignInEmail(params)).rejects.toThrow("Sign-in email delivery failed (422)");
  expect(json).not.toHaveBeenCalled();
});

it("propagates a network failure so Auth.js does not report a successful send", async () => {
  mockFetch.mockRejectedValue(new Error("Network unavailable"));
  await expect(sendSignInEmail(params)).rejects.toThrow("Network unavailable");
});

it.each(["apiKey", "from"] as const)("rejects missing %s before contacting Resend", async field => {
  await expect(sendSignInEmail({ ...params, provider: { ...params.provider, [field]: undefined } }))
    .rejects.toThrow("Sign-in email is not configured");
  expect(mockFetch).not.toHaveBeenCalled();
});
