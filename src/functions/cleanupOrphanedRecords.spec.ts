const mockConnectMongoose = jest.fn();
const mockUserFind = jest.fn();
const mockShootFind = jest.fn();
const mockShootDeleteMany = jest.fn();
const mockRoundScoreDeleteMany = jest.fn();
const mockShootParticipantDeleteMany = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  User: {
    find: mockUserFind,
  },
  Shoot: {
    find: mockShootFind,
    deleteMany: mockShootDeleteMany,
  },
  RoundScore: {
    deleteMany: mockRoundScoreDeleteMany,
  },
  ShootParticipant: {
    deleteMany: mockShootParticipantDeleteMany,
  },
}));

import { IShoot } from "@/models";
import { cleanupOrphanedRecords } from "./cleanupOrphanedRecords";

describe("cleanupOrphanedRecords", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to mongoose", async () => {
    mockUserFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    mockShootFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });
    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });

    await cleanupOrphanedRecords();

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should return zero deletions when no orphaned records exist", async () => {
    const validUsers = [{ _id: "user1" }, { _id: "user2" }];
    const validShoots = [{ _id: "shoot1", createdBy: "user1" }];

    mockUserFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue(validUsers),
    });

    // mockShootFind is called twice: first for orphaned shoots, second for valid shoots
    let shootFindCallCount = 0;
    mockShootFind.mockReturnValue({
      lean: jest.fn().mockImplementation(() => {
        shootFindCallCount++;
        return shootFindCallCount === 1 ? [] : validShoots;
      }),
    });

    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });
    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });

    const result = await cleanupOrphanedRecords();

    expect(result).toEqual({
      deletedShootsWithMissingCreators: 0,
      deletedRoundScores: 0,
      deletedParticipants: 0,
    });
  });

  it("should delete shoots with missing creators and their associated records", async () => {
    const validUsers = [{ _id: "user1" }];
    const orphanedShoots = [
      { _id: "shoot1", createdBy: "nonexistent" },
      { _id: "shoot2", createdBy: "alsoMissing" },
    ];
    const validShootsAfterDeletion = [] as IShoot[];

    mockUserFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue(validUsers),
    });

    // First call returns orphaned shoots, second call (after deletion) returns empty
    let shootFindCallCount = 0;
    mockShootFind.mockReturnValue({
      lean: jest.fn().mockImplementation(() => {
        shootFindCallCount++;
        return shootFindCallCount === 1
          ? orphanedShoots
          : validShootsAfterDeletion;
      }),
    });

    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
    });
    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 3 }),
    });
    mockShootDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 2 }),
    });

    const result = await cleanupOrphanedRecords();

    expect(result).toEqual({
      deletedShootsWithMissingCreators: 2,
      deletedRoundScores: 5,
      deletedParticipants: 3,
    });
  });

  it("should delete orphaned round scores", async () => {
    const validUsers = [{ _id: "user1" }];
    const validShoots = [{ _id: "shoot1" }];

    mockUserFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue(validUsers),
    });

    let shootFindCallCount = 0;
    mockShootFind.mockReturnValue({
      lean: jest.fn().mockImplementation(() => {
        shootFindCallCount++;
        return shootFindCallCount === 1 ? [] : validShoots;
      }),
    });

    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 10 }),
    });
    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 2 }),
    });

    const result = await cleanupOrphanedRecords();

    expect(result.deletedRoundScores).toBe(10);
    expect(mockRoundScoreDeleteMany).toHaveBeenCalled();
  });

  it("should delete orphaned shoot participants", async () => {
    const validUsers = [{ _id: "user1" }];
    const validShoots = [{ _id: "shoot1" }];

    mockUserFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue(validUsers),
    });

    let shootFindCallCount = 0;
    mockShootFind.mockReturnValue({
      lean: jest.fn().mockImplementation(() => {
        shootFindCallCount++;
        return shootFindCallCount === 1 ? [] : validShoots;
      }),
    });

    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    });
    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 7 }),
    });

    const result = await cleanupOrphanedRecords();

    expect(result.deletedParticipants).toBe(7);
    expect(mockShootParticipantDeleteMany).toHaveBeenCalled();
  });

  it("should handle case where deletedCount is undefined", async () => {
    const validUsers = [{ _id: "user1" }];
    const orphanedShoots = [{ _id: "shoot1", createdBy: "nonexistent" }];

    mockUserFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue(validUsers),
    });

    let shootFindCallCount = 0;
    mockShootFind.mockReturnValue({
      lean: jest.fn().mockImplementation(() => {
        shootFindCallCount++;
        return shootFindCallCount === 1 ? orphanedShoots : [];
      }),
    });

    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });
    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });
    mockShootDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    const result = await cleanupOrphanedRecords();

    expect(result.deletedShootsWithMissingCreators).toBe(0);
  });
});
