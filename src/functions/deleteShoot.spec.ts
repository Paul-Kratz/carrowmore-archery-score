const mockConnectMongoose = jest.fn();
const mockRoundScoreDeleteMany = jest.fn();
const mockShootParticipantDeleteMany = jest.fn();
const mockShootDeleteOne = jest.fn();
const mockStartTransaction = jest.fn();
const mockCommitTransaction = jest.fn();
const mockAbortTransaction = jest.fn();
const mockEndSession = jest.fn();
const mockStartSession = jest.fn().mockResolvedValue({
  startTransaction: mockStartTransaction,
  commitTransaction: mockCommitTransaction,
  abortTransaction: mockAbortTransaction,
  endSession: mockEndSession,
});

class MockObjectId {
  constructor(private readonly value: string) {}

  toString() {
    return this.value;
  }
}

jest.mock("mongoose", () => {
  return {
    __esModule: true,
    default: {
      startSession: mockStartSession,
    },
    Types: {
      ObjectId: MockObjectId,
    },
  };
});

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  RoundScore: {
    deleteMany: mockRoundScoreDeleteMany,
  },
  ShootParticipant: {
    deleteMany: mockShootParticipantDeleteMany,
  },
  Shoot: {
    deleteOne: mockShootDeleteOne,
  },
}));

import { deleteShoot } from "./deleteShoot";

describe("deleteShoot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoundScoreDeleteMany.mockResolvedValue({});
    mockShootParticipantDeleteMany.mockResolvedValue({});
    mockShootDeleteOne.mockResolvedValue({});
  });

  it("should connect to mongoose", async () => {
    await deleteShoot("507f1f77bcf86cd799439011");

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should delete round scores for the shoot", async () => {
    const shootId = "507f1f77bcf86cd799439011";

    await deleteShoot(shootId);

    expect(mockRoundScoreDeleteMany).toHaveBeenCalledWith(
      { shoot: expect.anything() },
      expect.objectContaining({ session: expect.any(Object) }),
    );
  });

  it("should delete shoot participants for the shoot", async () => {
    const shootId = "507f1f77bcf86cd799439011";

    await deleteShoot(shootId);

    expect(mockShootParticipantDeleteMany).toHaveBeenCalledWith({
      shoot: expect.anything(),
    }, expect.objectContaining({ session: expect.any(Object) }));
  });

  it("should delete the shoot itself", async () => {
    const shootId = "507f1f77bcf86cd799439011";

    await deleteShoot(shootId);

    expect(mockShootDeleteOne).toHaveBeenCalledWith(
      { _id: expect.anything() },
      expect.objectContaining({ session: expect.any(Object) }),
    );
  });

  it("should delete in correct order: round scores, participants, then shoot", async () => {
    const callOrder: string[] = [];

    mockRoundScoreDeleteMany.mockImplementation(async () => {
      callOrder.push("roundScores");
      return {};
    });

    mockShootParticipantDeleteMany.mockImplementation(async () => {
      callOrder.push("participants");
      return {};
    });

    mockShootDeleteOne.mockImplementation(async () => {
      callOrder.push("shoot");
      return {};
    });

    await deleteShoot("507f1f77bcf86cd799439011");

    expect(callOrder).toEqual(["roundScores", "participants", "shoot"]);
  });

  it("should handle different shoot IDs", async () => {
    const shootId1 = "507f1f77bcf86cd799439011";
    const shootId2 = "507f1f77bcf86cd799439012";

    await deleteShoot(shootId1);
    await deleteShoot(shootId2);

    expect(mockRoundScoreDeleteMany).toHaveBeenCalledTimes(2);
  });

  it("should complete deletion process without errors", async () => {
    await expect(
      deleteShoot("507f1f77bcf86cd799439011"),
    ).resolves.toBeUndefined();
  });

  it("commits the transaction on success", async () => {
    await deleteShoot("507f1f77bcf86cd799439011");

    expect(mockStartTransaction).toHaveBeenCalled();
    expect(mockCommitTransaction).toHaveBeenCalled();
    expect(mockAbortTransaction).not.toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });

  it("aborts the transaction if deletion fails", async () => {
    mockRoundScoreDeleteMany.mockRejectedValue(new Error("Delete failed"));

    await expect(
      deleteShoot("507f1f77bcf86cd799439011"),
    ).rejects.toThrow("Delete failed");

    expect(mockAbortTransaction).toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });
});
