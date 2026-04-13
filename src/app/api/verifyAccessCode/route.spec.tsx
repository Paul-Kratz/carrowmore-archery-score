import { GET } from "./route";

describe("/api/verifyAccessCode", () => {
  const originalGateCode = process.env.SITE_GATE_CODE;

  beforeEach(() => {
    process.env.SITE_GATE_CODE = "1609";
  });

  afterAll(() => {
    process.env.SITE_GATE_CODE = originalGateCode;
  });

  describe("GET", () => {
    it("should return 200 and success message when code is valid (1609)", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=1609",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      expect(data).toEqual({ message: "Access code is valid" });
    });

    it("should set x-gate-code cookie on valid code", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=1609",
      );

      const response = await GET(request);
      const setCookie = response.headers.get("set-cookie");

      expect(setCookie).toBeDefined();
      expect(setCookie).toContain("x-gate-code=valid");
      expect(setCookie).toContain("Path=/");
    });

    it("should return 401 and error message when code is invalid", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=wrong",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      expect(data).toEqual({ message: "Invalid access code" });
    });

    it("should not set cookie on invalid code", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=wrong",
      );

      const response = await GET(request);
      const setCookie = response.headers.get("set-cookie");

      expect(setCookie).toBeNull();
    });

    it("should return 401 when code is empty string", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ message: "Invalid access code" });
    });

    it("should return 401 when code parameter is missing", async () => {
      const request = new Request("http://localhost:3000/api/verifyAccessCode");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ message: "Invalid access code" });
    });

    it("should return 401 when code is numeric but incorrect", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=1234",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ message: "Invalid access code" });
    });

    it("should return 401 when code has correct digits but with extra characters", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=1609extra",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ message: "Invalid access code" });
    });

    it("should be case-sensitive for the code", async () => {
      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=1609",
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("should return 503 when the access code is not configured", async () => {
      delete process.env.SITE_GATE_CODE;

      const request = new Request(
        "http://localhost:3000/api/verifyAccessCode?code=1609",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toEqual({ message: "Access code not configured" });
    });
  });
});
