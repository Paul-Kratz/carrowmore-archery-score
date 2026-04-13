const mockAuth = jest.fn();
const mockGetShootAccess = jest.fn();
const mockGetShoot = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

jest.mock("@/functions/getShootAccess", () => ({
  getShootAccess: mockGetShootAccess,
}));

jest.mock("@/functions/getShoot", () => ({
  getShoot: mockGetShoot,
}));

import { GET } from "./route";

describe("/api/shoot/[shootId]", () => {
  const validShootId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET({} as Request, {
      params: Promise.resolve({ shootId: validShootId }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 for users outside the shoot", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
    mockGetShootAccess.mockResolvedValue({
      exists: true,
      isCreator: false,
      isParticipant: false,
    });

    const response = await GET({} as Request, {
      params: Promise.resolve({ shootId: validShootId }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
    expect(mockGetShoot).not.toHaveBeenCalled();
  });

  it("returns the shoot for a participant", async () => {
    const shoot = { id: "shoot-1" };

    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
    mockGetShootAccess.mockResolvedValue({
      exists: true,
      isCreator: false,
      isParticipant: true,
    });
    mockGetShoot.mockResolvedValue(shoot);

    const response = await GET({} as Request, {
      params: Promise.resolve({ shootId: validShootId }),
    });

    expect(mockGetShoot).toHaveBeenCalledWith({ shootId: validShootId });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(shoot);
  });

  it("returns 400 for malformed shoot ids", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });

    const response = await GET({} as Request, {
      params: Promise.resolve({ shootId: "bad-id" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid shootId" });
    expect(mockGetShootAccess).not.toHaveBeenCalled();
  });
});
