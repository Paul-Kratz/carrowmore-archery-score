const mockAuth = jest.fn();
const mockGetShootWithAccess = jest.fn();
const mockFormatResponse = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

jest.mock("@/functions/getShoot", () => ({
  getShootWithAccess: mockGetShootWithAccess,
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponse: mockFormatResponse,
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
    mockGetShootWithAccess.mockResolvedValue({
      exists: true,
      isCreator: false,
      isParticipant: false,
    });

    const response = await GET({} as Request, {
      params: Promise.resolve({ shootId: validShootId }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
    expect(mockFormatResponse).not.toHaveBeenCalled();
  });

  it("returns the shoot for a participant", async () => {
    const shoot = { id: "shoot-1" };
    const formattedShoot = { id: "shoot-1", formatted: true };

    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
    mockGetShootWithAccess.mockResolvedValue({
      exists: true,
      isCreator: false,
      isParticipant: true,
      shoot,
    });
    mockFormatResponse.mockReturnValue(formattedShoot);

    const response = await GET({} as Request, {
      params: Promise.resolve({ shootId: validShootId }),
    });

    expect(mockGetShootWithAccess).toHaveBeenCalledWith({
      shootId: validShootId,
      userId: "session-user",
    });
    expect(mockFormatResponse).toHaveBeenCalledWith(shoot);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(formattedShoot);
  });

  it("returns 400 for malformed shoot ids", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });

    const response = await GET({} as Request, {
      params: Promise.resolve({ shootId: "bad-id" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid shootId" });
    expect(mockGetShootWithAccess).not.toHaveBeenCalled();
  });
});
