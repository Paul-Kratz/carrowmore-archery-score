const mockConnectMongoose = jest.fn();
const mockShootAggregate = jest.fn();
const mockFormatResponse = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  Shoot: {
    aggregate: mockShootAggregate,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponse: mockFormatResponse,
}));

import { getShootSummary } from "./getShootSummary";

describe("getShootSummary", () => {
  const mockAggregatePipeline = {
    match: jest.fn().mockReturnThis(),
    lookup: jest.fn().mockReturnThis(),
    unwind: jest.fn().mockReturnThis(),
    addFields: jest.fn().mockReturnThis(),
    group: jest.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockShootAggregate.mockReturnValue(mockAggregatePipeline);
    mockAggregatePipeline.group.mockResolvedValue([]);
  });

  it("should connect to mongoose", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should call Shoot.aggregate", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    expect(mockShootAggregate).toHaveBeenCalled();
  });

  it("should lookup shootparticipants", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    expect(mockAggregatePipeline.lookup).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "shootparticipants",
        localField: "_id",
        foreignField: "shoot",
        as: "participants",
      }),
    );
  });

  it("should match by _id (not shoot) and participant user", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    const matchCall = mockAggregatePipeline.match.mock.calls[0][0];
    expect(matchCall).toHaveProperty("_id");
    expect(matchCall).toHaveProperty(["participants.user"]);
    expect(matchCall).not.toHaveProperty("shoot");
  });

  it("should unwind participants", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    expect(mockAggregatePipeline.unwind).toHaveBeenCalledWith("$participants");
  });

  it("should lookup users for participant info", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    expect(mockAggregatePipeline.lookup).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "users",
        localField: "participants.user",
        foreignField: "_id",
        as: "participantUser",
      }),
    );
  });

  it("should lookup roundscores with pipeline", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    expect(mockAggregatePipeline.lookup).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "roundscores",
        as: "roundScores",
      }),
    );
  });

  it("should group results by _id", async () => {
    await getShootSummary({ shootId: "shoot123", userId: "user123" });

    expect(mockAggregatePipeline.group).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "$_id",
        participants: { $push: "$participants" },
      }),
    );
  });

  it("should return formatted data when shoot is found", async () => {
    const mockData = {
      id: "shoot123",
      mode: "yellow",
      participants: [
        {
          userInfo: { name: "Test User" },
          roundScores: [10, 14, 8],
          totalScore: 32,
        },
      ],
    };

    mockAggregatePipeline.group.mockResolvedValue([mockData]);
    mockFormatResponse.mockReturnValue(mockData);

    const result = await getShootSummary({
      shootId: "shoot123",
      userId: "user123",
    });

    expect(mockFormatResponse).toHaveBeenCalledWith(mockData);
    expect(result).toEqual(mockData);
  });

  it("should return formatted null when no data is found", async () => {
    mockAggregatePipeline.group.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(null);

    const result = await getShootSummary({
      shootId: "nonexistent",
      userId: "user123",
    });

    expect(mockFormatResponse).toHaveBeenCalledWith(null);
    expect(result).toBeNull();
  });

  it("should handle multiple participants in result", async () => {
    const mockData = {
      id: "shoot123",
      mode: "red",
      participants: [
        {
          userInfo: { name: "User A" },
          roundScores: [20, 16, 14],
          totalScore: 50,
        },
        {
          userInfo: { name: "User B" },
          roundScores: [10, 8, 4],
          totalScore: 22,
        },
      ],
    };

    mockAggregatePipeline.group.mockResolvedValue([mockData]);
    mockFormatResponse.mockReturnValue(mockData);

    const result = await getShootSummary({
      shootId: "shoot123",
      userId: "user123",
    });

    expect((result as typeof mockData).participants).toHaveLength(2);
  });
});
