const mockAuth = jest.fn();
const mockGetShootAccess = jest.fn();
const mockUpdateRound = jest.fn();
const mockGetShoot = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

jest.mock("@/functions/getShootAccess", () => ({
  getShootAccess: mockGetShootAccess,
}));

jest.mock("@/functions/updateRound", () => ({
  updateRound: mockUpdateRound,
}));

jest.mock("@/functions/getShoot", () => ({
  getShoot: mockGetShoot,
}));

import { PATCH } from "./route";

describe("/api/roundScore", () => {
  const validShootId = "507f1f77bcf86cd799439011";
  const validParticipantId = "507f1f77bcf86cd799439012";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/roundScore", {
      method: "PATCH",
      body: JSON.stringify({
        participantId: validParticipantId,
        shootId: validShootId,
        roundNumber: 1,
        score: 20,
      }),
    });

    const response = await PATCH(request as never);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 when the user is not the shoot creator", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
    mockGetShootAccess.mockResolvedValue({
      exists: true,
      isCreator: false,
      isParticipant: true,
    });

    const request = new Request("http://localhost:3000/api/roundScore", {
      method: "PATCH",
      body: JSON.stringify({
        participantId: validParticipantId,
        shootId: validShootId,
        roundNumber: 1,
        score: 20,
      }),
    });

    const response = await PATCH(request as never);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
    expect(mockUpdateRound).not.toHaveBeenCalled();
  });

  it("returns 404 when the participant score row does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
    mockGetShootAccess.mockResolvedValue({
      exists: true,
      isCreator: true,
      isParticipant: true,
    });
    mockUpdateRound.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });

    const request = new Request("http://localhost:3000/api/roundScore", {
      method: "PATCH",
      body: JSON.stringify({
        participantId: validParticipantId,
        shootId: validShootId,
        roundNumber: 1,
        score: 20,
      }),
    });

    const response = await PATCH(request as never);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Round score not found" });
  });

  it("updates a participant score when the creator is authorized", async () => {
    const shoot = { id: "shoot-1" };

    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
    mockGetShootAccess.mockResolvedValue({
      exists: true,
      isCreator: true,
      isParticipant: true,
    });
    mockUpdateRound.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    mockGetShoot.mockResolvedValue(shoot);

    const request = new Request("http://localhost:3000/api/roundScore", {
      method: "PATCH",
      body: JSON.stringify({
        participantId: validParticipantId,
        shootId: validShootId,
        roundNumber: 2,
        score: 16,
      }),
    });

    const response = await PATCH(request as never);

    expect(mockUpdateRound).toHaveBeenCalledWith(
      validParticipantId,
      validShootId,
      2,
      16,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(shoot);
  });

  it("returns 400 for malformed participant or shoot ids", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });

    const response = await PATCH(
      new Request("http://localhost:3000/api/roundScore", {
        method: "PATCH",
        body: JSON.stringify({
          participantId: "bad-id",
          shootId: validShootId,
          roundNumber: 1,
          score: 20,
        }),
      }) as never,
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Invalid participantId or shootId",
    });
    expect(mockGetShootAccess).not.toHaveBeenCalled();
  });
});
