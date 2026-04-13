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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/shoot", {
        method: "POST",
        body: JSON.stringify({ mode: "yellow", participantIds: ["user-2"] }),
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
          participantIds: ["user-2"],
        }),
      });

      const response = await POST(request as never);

      expect(mockCreateNewShoot).toHaveBeenCalledWith({
        userId: "session-user",
        mode: "yellow",
        participantIds: ["user-2"],
      });
      expect(response.status).toBe(201);
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
        body: JSON.stringify({ shootId: "shoot-1", notes: "note" }),
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
          shootId: "shoot-1",
          notes: "note",
          completed: true,
        }),
      });

      const response = await PATCH(request as never);

      expect(mockUpdateShoot).toHaveBeenCalledWith({
        shootId: "shoot-1",
        notes: "note",
        completed: true,
      });
      expect(response.status).toBe(200);
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
        "http://localhost:3000/api/shoot?shootId=missing-shoot",
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
        "http://localhost:3000/api/shoot?shootId=shoot-1",
        { method: "DELETE" },
      );

      const response = await DELETE(request as never);

      expect(mockDeleteShoot).toHaveBeenCalledWith("shoot-1");
      expect(response.status).toBe(200);
    });
  });
});
