const mockConnectMongoose = jest.fn();
const mockRoundScoreFind = jest.fn();
const mockRoundScoreBulkWrite = jest.fn();
const mockShootParticipantFind = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  RoundScore: {
    find: mockRoundScoreFind,
    bulkWrite: mockRoundScoreBulkWrite,
  },
  ShootParticipant: {
    find: mockShootParticipantFind,
  },
}));

import { backfillRoundScoreParticipants } from "./backfillRoundScoreParticipants";

describe("backfillRoundScoreParticipants", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns zeroes when there are no legacy scores", async () => {
    mockRoundScoreFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    const result = await backfillRoundScoreParticipants();

    expect(result).toEqual({ scanned: 0, updated: 0, unresolved: 0 });
    expect(mockShootParticipantFind).not.toHaveBeenCalled();
    expect(mockRoundScoreBulkWrite).not.toHaveBeenCalled();
  });

  it("backfills participant ids for matching legacy scores", async () => {
    mockRoundScoreFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: "score-1", shoot: "shoot-1", user: "user-1" },
        { _id: "score-2", shoot: "shoot-1", user: "user-2" },
      ]),
    });
    mockShootParticipantFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: "participant-1", shoot: "shoot-1", user: "user-1" },
      ]),
    });
    mockRoundScoreBulkWrite.mockResolvedValue({ modifiedCount: 1 });

    const result = await backfillRoundScoreParticipants();

    expect(mockRoundScoreBulkWrite).toHaveBeenCalledWith([
      {
        updateOne: {
          filter: { _id: "score-1" },
          update: { $set: { participant: "participant-1" } },
        },
      },
    ]);
    expect(result).toEqual({ scanned: 2, updated: 1, unresolved: 1 });
  });
});
