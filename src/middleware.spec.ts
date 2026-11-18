const mockAuth = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

jest.mock("next/server", () => {
  return {
    NextResponse: {
      next: () => new Response(null, { status: 200 }),
      redirect: (url: URL) =>
        new Response(null, {
          status: 307,
          headers: { location: url.toString() },
        }),
    },
  };
});

// Next bootstraps this global in its server runtime.
import { AsyncLocalStorage } from "node:async_hooks";
Object.assign(globalThis, { AsyncLocalStorage });

import { config, proxy } from "./proxy";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

function createRequest(url: string, cookies: Record<string, string> = {}) {
  const parsedUrl = new URL(url, "http://localhost:3000");
  const cookieMap = new Map(Object.entries(cookies));
  return {
    url: parsedUrl.toString(),
    nextUrl: parsedUrl,
    cookies: {
      has: (name: string) => cookieMap.has(name),
      get: (name: string) =>
        cookieMap.has(name) ? { name, value: cookieMap.get(name)! } : undefined,
      set: (name: string, value: string) => cookieMap.set(name, value),
    },
  } as unknown as Parameters<typeof proxy>[0];
}

describe("Proxy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("config", () => {
    it.each([
      "/icons/apple-touch-icon.png",
      "/icons/favicon-32.png",
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/icons/icon.svg",
      "/icon.svg",
      "/manifest.webmanifest",
      "/icons/apple-touch-icon.png?v=2",
      "/manifest.webmanifest?v=2",
    ])("serves public installation asset %s without running the auth proxy", (path) => {
      expect(unstable_doesMiddlewareMatch({ config, url: `http://localhost:3000${path}` })).toBe(false);
    });

    it.each([
      "/",
      "/setup",
      "/history",
      "/shoot/shoot-1/1",
      "/gate",
      "/icons-private",
      "/icon.svg/private",
      "/manifest.webmanifest/private",
      "/manifestXwebmanifest",
    ])("keeps the proxy active for %s", (path) => {
      expect(unstable_doesMiddlewareMatch({ config, url: `http://localhost:3000${path}` })).toBe(true);
    });

    it("should have matcher array configured", () => {
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
      expect(config.matcher.length).toBeGreaterThan(0);
    });

    it("should exclude API routes from middleware", () => {
      const matcher = config.matcher[0];
      expect(matcher).toContain("api");
    });

    it("should exclude _next/static from middleware", () => {
      const matcher = config.matcher[0];
      expect(matcher).toContain("_next/static");
    });

    it("should exclude _next/image from middleware", () => {
      const matcher = config.matcher[0];
      expect(matcher).toContain("_next/image");
    });

    it("should exclude favicon.ico from middleware", () => {
      const matcher = config.matcher[0];
      expect(matcher).toContain("favicon.ico");
    });

    it("should match all other routes", () => {
      const matcher = config.matcher[0];
      expect(matcher).toMatch(/^\/\(/);
    });
  });

  describe("gate code check", () => {
    it("should redirect to /gate when no gate code cookie is present", async () => {
      const req = createRequest("http://localhost:3000/setup");

      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/gate");
      expect(mockAuth).not.toHaveBeenCalled();
    });

    it("should allow /gate page when no gate code cookie is present", async () => {
      const req = createRequest("http://localhost:3000/gate");

      const response = await proxy(req);

      expect(response.status).toBe(200);
      expect(mockAuth).not.toHaveBeenCalled();
    });

    it("should redirect from /gate to / when gate code cookie exists", async () => {
      const req = createRequest("http://localhost:3000/gate", {
        "x-gate-code": "valid",
      });

      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/");
      expect(mockAuth).not.toHaveBeenCalled();
    });

    it("should pass through to auth when gate code cookie exists on non-gate route", async () => {
      mockAuth.mockResolvedValue(new Response(null, { status: 200 }));
      const req = createRequest("http://localhost:3000/setup", {
        "x-gate-code": "valid",
      });

      await proxy(req);

      expect(mockAuth).toHaveBeenCalledWith(req);
    });
  });

  describe("middleware export", () => {
    it("should export proxy function", () => {
      expect(proxy).toBeDefined();
      expect(typeof proxy).toBe("function");
    });
  });
});
