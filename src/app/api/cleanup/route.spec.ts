const mockAuth = jest.fn();
const mockGetAdminUserId = jest.fn();
const mockCleanupOrphanedRecords = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

jest.mock("@/lib/runtimeConfig", () => ({
  getAdminUserId: mockGetAdminUserId,
}));

jest.mock("@/functions/cleanupOrphanedRecords", () => ({
  cleanupOrphanedRecords: mockCleanupOrphanedRecords,
}));

import { POST } from "./route";

describe("/api/cleanup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 503 when no admin is configured", async () => {
    mockGetAdminUserId.mockReturnValue(null);

    const response = await POST();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      error: "This endpoint is disabled",
    });
  });

  it("returns 401 when the caller is unauthenticated", async () => {
    mockGetAdminUserId.mockReturnValue("admin-user");
    mockAuth.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      success: false,
      error: "Unauthorized",
    });
  });

  it("returns 403 when the caller is not the configured admin", async () => {
    mockGetAdminUserId.mockReturnValue("admin-user");
    mockAuth.mockResolvedValue({ user: { id: "other-user" } });

    const response = await POST();

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("runs cleanup for the configured admin", async () => {
    mockGetAdminUserId.mockReturnValue("admin-user");
    mockAuth.mockResolvedValue({ user: { id: "admin-user" } });
    mockCleanupOrphanedRecords.mockResolvedValue({
      deletedShootsWithMissingCreators: 1,
      deletedRoundScores: 2,
      deletedParticipants: 3,
    });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      deletedShootsWithMissingCreators: 1,
      deletedRoundScores: 2,
      deletedParticipants: 3,
    });
  });
});
