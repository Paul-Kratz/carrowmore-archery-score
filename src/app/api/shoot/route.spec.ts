const mockAuth = jest.fn();
const mockCreateNewShoot = jest.fn();
const mockUpdateShoot = jest.fn();
const mockDeleteShoot = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

jest.mock("@/functions/createNewShoot", () => ({
  createNewShoot: mockCreateNewShoot,
}));

jest.mock("@/functions/updateShoot", () => ({
  updateShoot: mockUpdateShoot,
}));

jest.mock("@/functions/deleteShoot", () => ({
  deleteShoot: mockDeleteShoot,
}));

import { DELETE, PATCH, POST } from "./route";

describe("/api/shoot", () => {
  const validShootId = "507f1f77bcf86cd799439011";
  const validParticipantId = "507f1f77bcf86cd799439012";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participantIds: [validParticipantId],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("uses the authenticated user as the shoot creator", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockResolvedValue({ id: "shoot-1" });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          userId: "spoofed-user",
          participantIds: [validParticipantId],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith(expect.objectContaining({
        userId: "session-user",
        participantIds: [validParticipantId],
        guestNames: [],
        clubId: "carrowmore",
      }));
      expect(response.status).toBe(201);
    });

    it("passes guest names through to shoot creation", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockResolvedValue({ id: "shoot-1" });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participantIds: [validParticipantId],
          guestNames: ["Charlie"],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith(expect.objectContaining({
        userId: "session-user",
        participantIds: [validParticipantId],
        guestNames: ["Charlie"],
        clubId: "carrowmore",
      }));
      expect(response.status).toBe(201);
    });

    it("returns 400 for malformed participant ids", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participantIds: ["not-an-object-id"],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid participants, participantIds, guestNames, or clubId",
      });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("returns 400 for unknown clubs", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participantIds: [validParticipantId],
          clubId: "unknown-club",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid participants, participantIds, guestNames, or clubId",
      });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("accepts legacy participant ids without shoot mode", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockResolvedValue({ id: "shoot-1" });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participantIds: [validParticipantId],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith(expect.objectContaining({
        userId: "session-user",
        participantIds: [validParticipantId],
        guestNames: [],
        clubId: "carrowmore",
      }));
      expect(response.status).toBe(201);
    });

    it("returns 400 for participant peg colours not supported by the selected club", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participants: [{ userId: validParticipantId, pegColor: "blue" }],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid participants, participantIds, guestNames, or clubId",
      });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("accepts participant peg colours supported by the selected club", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockResolvedValue({ id: "shoot-1" });
      const participants = [{ userId: validParticipantId, pegColor: "blue" }];

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participants,
          clubId: "marbleArchers",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith(expect.objectContaining({
        userId: "session-user",
        participants,
        clubId: "marbleArchers",
      }));
      expect(response.status).toBe(201);
    });

    it("accepts participant peg colors without deriving shoot mode", async () => {
      const currentUserId = "507f1f77bcf86cd799439013";
      mockAuth.mockResolvedValue({ user: { id: currentUserId } });
      mockCreateNewShoot.mockResolvedValue({ id: "shoot-1" });

      const participants = [
        { userId: currentUserId, pegColor: "red" },
        { userId: validParticipantId, pegColor: "yellow" },
        { guestName: "Charlie", pegColor: "red" },
      ];

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participants,
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith(expect.objectContaining({
        userId: currentUserId,
        participants,
        clubId: "carrowmore",
      }));
      expect(response.status).toBe(201);
    });

    it("returns 400 for participant peg colors not supported by the selected club", async () => {
      const currentUserId = "507f1f77bcf86cd799439013";
      mockAuth.mockResolvedValue({ user: { id: currentUserId } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participants: [{ userId: currentUserId, pegColor: "blue" }],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid participants, participantIds, guestNames, or clubId",
      });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("returns 400 for guest validation errors from creation", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockRejectedValue(
        new Error("Guest names cannot be empty"),
      );

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          participantIds: [],
          guestNames: [""],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Guest names cannot be empty",
      });
    });
  });

  describe("PATCH", () => {
    it("returns 404 when the shoot does not exist or the user is not the creator", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockUpdateShoot.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "PATCH",
        body: JSON.stringify({ shootId: validShootId, notes: "note" }),
      });

      const response = await PATCH(request as never);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: "Shoot not found or forbidden",
      });
      expect(mockUpdateShoot).toHaveBeenCalledWith({
        shootId: validShootId,
        userId: "session-user",
        notes: "note",
      });
    });

    it("updates the shoot when the user is the creator", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockUpdateShoot.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "PATCH",
        body: JSON.stringify({
          shootId: validShootId,
          notes: "note",
          completed: true,
        }),
      });

      const response = await PATCH(request as never);

      expect(mockUpdateShoot).toHaveBeenCalledWith({
        shootId: validShootId,
        userId: "session-user",
        notes: "note",
        completed: true,
      });
      expect(response.status).toBe(200);
    });

    it("returns 400 for malformed shoot ids on update", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "PATCH",
        body: JSON.stringify({ shootId: "bad-id", notes: "note" }),
      });

      const response = await PATCH(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Invalid shootId" });
      expect(mockUpdateShoot).not.toHaveBeenCalled();
    });
  });

  describe("DELETE", () => {
    it("returns 404 when the shoot does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockDeleteShoot.mockResolvedValue({ deletedCount: 0 });

      const request = new Request(
        `http://localhost:3000/api/shoot?shootId=${validShootId}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request as never);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: "Shoot not found or forbidden",
      });
      expect(mockDeleteShoot).toHaveBeenCalledWith({
        shootId: validShootId,
        userId: "session-user",
      });
    });

    it("deletes the shoot when the user is the creator", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockDeleteShoot.mockResolvedValue({ deletedCount: 1 });

      const request = new Request(
        `http://localhost:3000/api/shoot?shootId=${validShootId}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request as never);

      expect(mockDeleteShoot).toHaveBeenCalledWith({
        shootId: validShootId,
        userId: "session-user",
      });
      expect(response.status).toBe(200);
    });

    it("returns 400 for malformed shoot ids on delete", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const response = await DELETE(
        new Request("http://localhost:3000/api/shoot?shootId=bad-id", {
          method: "DELETE",
        }) as never,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Invalid shootId" });
      expect(mockDeleteShoot).not.toHaveBeenCalled();
    });
  });
});
