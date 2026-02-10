import { config } from "./middleware";

// Mock the auth module
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

describe("Middleware", () => {
  describe("config", () => {
    it("should have the correct runtime configured", () => {
      expect(config.runtime).toBe("nodejs");
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
      // The pattern should start with /( to match routes
      expect(matcher).toMatch(/^\/\(/);
    });
  });

  describe("middleware export", () => {
    it("should export middleware function", async () => {
      const { middleware } = await import("./middleware");
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe("function");
    });

    it("should be the auth function from lib/auth", async () => {
      const { middleware } = await import("./middleware");
      const { auth } = await import("@/lib/auth");
      expect(middleware).toBe(auth);
    });
  });
});
