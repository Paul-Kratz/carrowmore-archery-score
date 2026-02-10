const mockConnectMongoose = jest.fn();
const mockRoundScoreDeleteMany = jest.fn();
const mockShootParticipantDeleteMany = jest.fn();
const mockShootDeleteOne = jest.fn();

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
    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });
    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });
    mockShootDeleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });
  });

  it("should connect to mongoose", async () => {
    await deleteShoot("shoot123");

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should delete round scores for the shoot", async () => {
    const shootId = "shoot123";

    await deleteShoot(shootId);

    expect(mockRoundScoreDeleteMany).toHaveBeenCalledWith({ shoot: shootId });
    expect(mockRoundScoreDeleteMany().exec).toHaveBeenCalled();
  });

  it("should delete shoot participants for the shoot", async () => {
    const shootId = "shoot123";

    await deleteShoot(shootId);

    expect(mockShootParticipantDeleteMany).toHaveBeenCalledWith({
      shoot: shootId,
    });
    expect(mockShootParticipantDeleteMany().exec).toHaveBeenCalled();
  });

  it("should delete the shoot itself", async () => {
    const shootId = "shoot123";

    await deleteShoot(shootId);

    expect(mockShootDeleteOne).toHaveBeenCalledWith({ _id: shootId });
    expect(mockShootDeleteOne().exec).toHaveBeenCalled();
  });

  it("should delete in correct order: round scores, participants, then shoot", async () => {
    const callOrder: string[] = [];

    mockRoundScoreDeleteMany.mockReturnValue({
      exec: jest.fn().mockImplementation(() => {
        callOrder.push("roundScores");
        return Promise.resolve({});
      }),
    });

    mockShootParticipantDeleteMany.mockReturnValue({
      exec: jest.fn().mockImplementation(() => {
        callOrder.push("participants");
        return Promise.resolve({});
      }),
    });

    mockShootDeleteOne.mockReturnValue({
      exec: jest.fn().mockImplementation(() => {
        callOrder.push("shoot");
        return Promise.resolve({});
      }),
    });

    await deleteShoot("shoot123");

    expect(callOrder).toEqual(["roundScores", "participants", "shoot"]);
  });

  it("should handle different shoot IDs", async () => {
    const shootId1 = "abc123";
    const shootId2 = "xyz789";

    await deleteShoot(shootId1);
    await deleteShoot(shootId2);

    expect(mockRoundScoreDeleteMany).toHaveBeenCalledWith({ shoot: shootId1 });
    expect(mockRoundScoreDeleteMany).toHaveBeenCalledWith({ shoot: shootId2 });
  });

  it("should complete deletion process without errors", async () => {
    await expect(deleteShoot("shoot123")).resolves.toBeUndefined();
  });
});
