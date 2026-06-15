const mockAuth = jest.fn();
const mockUpdateRound = jest.fn();
const mockGetShoot = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
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

  it("returns 404 when the shoot does not exist or the user is not the creator", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
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
    expect(await response.json()).toEqual({
      error: "Round score not found or forbidden",
    });
    expect(mockUpdateRound).toHaveBeenCalledWith({
      participantId: validParticipantId,
      shootId: validShootId,
      userId: "session-user",
      roundNumber: 1,
      score: 20,
    });
  });

  it("returns 404 when the participant score row does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
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
    expect(await response.json()).toEqual({
      error: "Round score not found or forbidden",
    });
  });

  it("updates a participant score when the creator is authorized", async () => {
    const shoot = { id: "shoot-1" };

    mockAuth.mockResolvedValue({ user: { id: "session-user" } });
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

    expect(mockUpdateRound).toHaveBeenCalledWith({
      participantId: validParticipantId,
      shootId: validShootId,
      userId: "session-user",
      roundNumber: 2,
      score: 16,
    });
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
    expect(mockUpdateRound).not.toHaveBeenCalled();
  });
});
