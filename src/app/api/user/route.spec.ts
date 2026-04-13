// Mock dependencies before imports
const mockAuth = jest.fn();
const mockConnectMongoose = jest.fn();
const mockFormatResponse = jest.fn((data) => data);
const mockUserFind = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  User: {
    find: mockUserFind,
    findByIdAndUpdate: mockUserFindByIdAndUpdate,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponse: mockFormatResponse,
}));

import { GET, POST } from "./route";

describe("/api/user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
      expect(mockConnectMongoose).not.toHaveBeenCalled();
    });

    it("should return 401 when session exists but user is missing", async () => {
      mockAuth.mockResolvedValue({ user: null });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return all users when authenticated", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };
      const mockUsers = [
        { _id: "user1", name: "User 1" },
        { _id: "user2", name: "User 2" },
      ];
      const formattedUsers = [
        { id: "user1", name: "User 1" },
        { id: "user2", name: "User 2" },
      ];

      mockAuth.mockResolvedValue(mockSession);
      mockConnectMongoose.mockResolvedValue(undefined);

      mockUserFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUsers),
      });

      mockFormatResponse.mockReturnValue(formattedUsers);

      const response = await GET();
      const data = await response.json();

      expect(mockAuth).toHaveBeenCalled();
      expect(mockConnectMongoose).toHaveBeenCalled();
      expect(mockUserFind).toHaveBeenCalledWith({}, { name: 1 });
      expect(mockFormatResponse).toHaveBeenCalledWith(mockUsers);
      expect(response.status).toBe(200);
      expect(data).toEqual(formattedUsers);
    });

    it("should return empty array when no users exist", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockConnectMongoose.mockResolvedValue(undefined);

      mockUserFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      mockFormatResponse.mockReturnValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe("POST", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null as unknown as never);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({ name: "Test User" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
      expect(mockConnectMongoose).not.toHaveBeenCalled();
    });

    it("should return 401 when session exists but user is missing", async () => {
      mockAuth.mockResolvedValue({ user: null } as unknown as never);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({ name: "Test User" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 when name is missing", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };

      mockAuth.mockResolvedValue(mockSession as unknown as never);
      mockConnectMongoose.mockResolvedValue(undefined);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Name is required" });
    });

    it("should return 400 when name is null", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };

      mockAuth.mockResolvedValue(mockSession as unknown as never);
      mockConnectMongoose.mockResolvedValue(undefined);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({ name: null }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Name is required" });
    });

    it("should return 400 when name is empty string", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockConnectMongoose.mockResolvedValue(undefined);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Name is required" });
    });

    it("should update user name when valid name is provided", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };
      const mockUpdatedUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Updated Name",
      };
      const formattedUser = {
        id: "user123",
        email: "test@example.com",
        name: "Updated Name",
      };

      mockAuth.mockResolvedValue(mockSession);
      mockConnectMongoose.mockResolvedValue(undefined);

      mockUserFindByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUpdatedUser),
      });

      mockFormatResponse.mockReturnValue(formattedUser);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(mockAuth).toHaveBeenCalled();
      expect(mockConnectMongoose).toHaveBeenCalled();
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { name: "Updated Name" },
        { new: true, fields: { name: 1 } },
      );
      expect(mockFormatResponse).toHaveBeenCalledWith(mockUpdatedUser);
      expect(response.status).toBe(200);
      expect(data).toEqual(formattedUser);
    });

    it("should handle names with special characters", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };
      const specialName = "O'Connor-Smith Jr.";
      const mockUpdatedUser = {
        _id: "user123",
        email: "test@example.com",
        name: specialName,
      };
      const formattedUser = {
        id: "user123",
        email: "test@example.com",
        name: specialName,
      };

      mockAuth.mockResolvedValue(mockSession);
      mockConnectMongoose.mockResolvedValue(undefined);

      mockUserFindByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUpdatedUser),
      });

      mockFormatResponse.mockReturnValue(formattedUser);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({ name: specialName }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(specialName);
    });

    it("should ignore extra fields in request body", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
      };
      const mockUpdatedUser = {
        _id: "user123",
        email: "test@example.com",
        name: "New Name",
      };
      const formattedUser = {
        id: "user123",
        email: "test@example.com",
        name: "New Name",
      };

      mockAuth.mockResolvedValue(mockSession);
      mockConnectMongoose.mockResolvedValue(undefined);

      mockUserFindByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUpdatedUser),
      });

      mockFormatResponse.mockReturnValue(formattedUser);

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({
          name: "New Name",
          email: "hacker@example.com",
          role: "admin",
        }),
      });

      const response = await POST(request);

      // Should only update name, not email or role
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { name: "New Name" },
        { new: true, fields: { name: 1 } },
      );
      expect(response.status).toBe(200);
    });
  });
});
