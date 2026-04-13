const mockConnectMongoose = jest.fn();
const mockRoundScoreUpdateOne = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  RoundScore: {
    updateOne: mockRoundScoreUpdateOne,
  },
}));

import { updateRound } from "./updateRound";

describe("updateRound", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to mongoose", async () => {
    mockRoundScoreUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    await updateRound("user123", "shoot123", 5, 10);

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should update round score with correct parameters", async () => {
    const userId = "user123";
    const shootId = "shoot123";
    const roundNumber = 5;
    const score = 10;

    mockRoundScoreUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    await updateRound(userId, shootId, roundNumber, score);

    expect(mockRoundScoreUpdateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        roundNumber: 5,
      }),
      { score: 10 },
    );
  });

  it("should return update result", async () => {
    const mockResult = { modifiedCount: 1, matchedCount: 1 };
    mockRoundScoreUpdateOne.mockResolvedValue(mockResult);

    const result = await updateRound("user123", "shoot123", 1, 8);

    expect(result).toEqual(mockResult);
  });

  it("should handle different round numbers", async () => {
    mockRoundScoreUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    await updateRound("user123", "shoot123", 1, 10);
    await updateRound("user123", "shoot123", 10, 5);

    expect(mockRoundScoreUpdateOne).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ roundNumber: 1 }),
      { score: 10 },
    );

    expect(mockRoundScoreUpdateOne).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ roundNumber: 10 }),
      { score: 5 },
    );
  });

  it("should handle different score values", async () => {
    mockRoundScoreUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    await updateRound("user123", "shoot123", 1, 0);
    await updateRound("user123", "shoot123", 2, 10);
    await updateRound("user123", "shoot123", 3, 5);

    expect(mockRoundScoreUpdateOne).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      { score: 0 },
    );

    expect(mockRoundScoreUpdateOne).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      { score: 10 },
    );

    expect(mockRoundScoreUpdateOne).toHaveBeenNthCalledWith(
      3,
      expect.anything(),
      { score: 5 },
    );
  });

  it("should handle different user IDs", async () => {
    mockRoundScoreUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    await updateRound("user1", "shoot123", 1, 10);
    await updateRound("user2", "shoot123", 1, 8);

    expect(mockRoundScoreUpdateOne).toHaveBeenCalledTimes(2);
  });

  it("should handle different shoot IDs", async () => {
    mockRoundScoreUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    await updateRound("user123", "shoot1", 1, 10);
    await updateRound("user123", "shoot2", 1, 8);

    expect(mockRoundScoreUpdateOne).toHaveBeenCalledTimes(2);
  });

  it("should reject when the round score update fails", async () => {
    const error = new Error("Database error");
    mockRoundScoreUpdateOne.mockRejectedValue(error);

    await expect(updateRound("user123", "shoot123", 1, 10)).rejects.toThrow(
      "Database error",
    );
  });

  it("should reject when mongoose connection fails", async () => {
    mockRoundScoreUpdateOne.mockRejectedValue(new Error("Connection failed"));

    await expect(updateRound("user123", "shoot123", 1, 10)).rejects.toThrow(
      "Connection failed",
    );
  });

  it("should handle no documents matched", async () => {
    mockRoundScoreUpdateOne.mockResolvedValue({
      modifiedCount: 0,
      matchedCount: 0,
    });

    const result = await updateRound("user123", "shoot123", 1, 10);

    expect(result).toEqual({ modifiedCount: 0, matchedCount: 0 });
  });
});
