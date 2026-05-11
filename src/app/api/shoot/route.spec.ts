const mockAuth = jest.fn();
const mockCreateNewShoot = jest.fn();
const mockUpdateShoot = jest.fn();
const mockDeleteShoot = jest.fn();
const mockGetShootAccess = jest.fn();

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

jest.mock("@/functions/getShootAccess", () => ({
  getShootAccess: mockGetShootAccess,
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
          mode: "yellow",
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
          mode: "yellow",
          participantIds: [validParticipantId],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith({
        userId: "session-user",
        mode: "yellow",
        participantIds: [validParticipantId],
        guestNames: [],
        clubId: "carrowmore",
      });
      expect(response.status).toBe(201);
    });

    it("passes guest names through to shoot creation", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockResolvedValue({ id: "shoot-1" });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          mode: "yellow",
          participantIds: [validParticipantId],
          guestNames: ["Charlie"],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith({
        userId: "session-user",
        mode: "yellow",
        participantIds: [validParticipantId],
        guestNames: ["Charlie"],
        clubId: "carrowmore",
      });
      expect(response.status).toBe(201);
    });

    it("returns 400 for malformed participant ids", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          mode: "yellow",
          participantIds: ["not-an-object-id"],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid mode, participantIds, guestNames, or clubId",
      });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("returns 400 for unknown clubs", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          mode: "yellow",
          participantIds: [validParticipantId],
          clubId: "unknown-club",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid mode, participantIds, guestNames, or clubId",
      });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("returns 400 for modes not supported by the selected club", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          mode: "blue",
          participantIds: [validParticipantId],
          clubId: "carrowmore",
        }),
      });

      const response = await POST(request as never);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid mode, participantIds, guestNames, or clubId",
      });
      expect(mockCreateNewShoot).not.toHaveBeenCalled();
    });

    it("accepts modes supported by the selected club", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockResolvedValue({ id: "shoot-1" });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          mode: "blue",
          participantIds: [validParticipantId],
          clubId: "marbleArchers",
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith({
        userId: "session-user",
        mode: "blue",
        participantIds: [validParticipantId],
        guestNames: [],
        clubId: "marbleArchers",
      });
      expect(response.status).toBe(201);
    });

    it("returns 400 for guest validation errors from creation", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockCreateNewShoot.mockRejectedValue(
        new Error("Guest names cannot be empty"),
      );

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({
          mode: "yellow",
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
    it("returns 403 when the user is not the shoot creator", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockGetShootAccess.mockResolvedValue({
        exists: true,
        isCreator: false,
        isParticipant: true,
      });

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "PATCH",
        body: JSON.stringify({ shootId: validShootId, notes: "note" }),
      });

      const response = await PATCH(request as never);

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: "Forbidden" });
      expect(mockUpdateShoot).not.toHaveBeenCalled();
    });

    it("updates the shoot when the user is the creator", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockGetShootAccess.mockResolvedValue({
        exists: true,
        isCreator: true,
        isParticipant: true,
      });

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
      expect(mockGetShootAccess).not.toHaveBeenCalled();
    });
  });

  describe("DELETE", () => {
    it("returns 404 when the shoot does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockGetShootAccess.mockResolvedValue({
        exists: false,
        isCreator: false,
        isParticipant: false,
      });

      const request = new Request(
        `http://localhost:3000/api/shoot?shootId=${validShootId}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request as never);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Shoot not found" });
      expect(mockDeleteShoot).not.toHaveBeenCalled();
    });

    it("deletes the shoot when the user is the creator", async () => {
      mockAuth.mockResolvedValue({ user: { id: "session-user" } });
      mockGetShootAccess.mockResolvedValue({
        exists: true,
        isCreator: true,
        isParticipant: true,
      });

      const request = new Request(
        `http://localhost:3000/api/shoot?shootId=${validShootId}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request as never);

      expect(mockDeleteShoot).toHaveBeenCalledWith(validShootId);
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
      expect(mockGetShootAccess).not.toHaveBeenCalled();
    });
  });
});
