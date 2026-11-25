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
import { createTestShootData } from "@/testFixtures/shoot";

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
    const formattedShoot = createTestShootData({ createdBy: "session-user" });

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
    expect(await response.json()).toEqual(JSON.parse(JSON.stringify(formattedShoot)));
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

  it("does not send other archers' detailed scores to a participant", async () => {
    const fixture = createTestShootData({ createdBy: "tracker" });
    const own = { ...fixture.participants[0], id: "own", user: "session-user" };
    const shoot = { ...fixture, participants: [own, fixture.participants[0]] };
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
    mockGetShootWithAccess.mockResolvedValue({ exists: true, isCreator: false, isParticipant: true, shoot });
    mockFormatResponse.mockReturnValue(shoot);
    const response = await GET({} as Request, { params: Promise.resolve({ shootId: validShootId }) });
    const body = await response.json();
    expect(body.participants[0].scores).toHaveLength(2);
    expect(body.participants[1].scores).toEqual([]);
    expect(body.participants[1].totalScore).toBe(20);
    expect(body.participants[1].scoreDetailsVisible).toBe(false);
  });
});
