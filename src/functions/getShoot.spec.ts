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

import { getShoot } from "./getShoot";

describe("getShoot", () => {
  const mockAggregatePipeline = {
    match: jest.fn().mockReturnThis(),
    lookup: jest.fn().mockReturnThis(),
    unwind: jest.fn().mockReturnThis(),
    addFields: jest.fn().mockReturnThis(),
    group: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockShootAggregate.mockReturnValue(mockAggregatePipeline);
  });

  it("should connect to mongoose", async () => {
    mockFormatResponse.mockResolvedValue({});

    await getShoot({ shootId: "shoot123" });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should call Shoot.aggregate", async () => {
    mockFormatResponse.mockResolvedValue({});

    await getShoot({ shootId: "shoot123" });

    expect(mockShootAggregate).toHaveBeenCalled();
  });

  it("should match shoot by ID", async () => {
    mockFormatResponse.mockResolvedValue({});

    await getShoot({ shootId: "shoot123" });

    expect(mockAggregatePipeline.match).toHaveBeenCalled();
  });

  it("should lookup participants and round scores", async () => {
    mockFormatResponse.mockResolvedValue({});

    await getShoot({ shootId: "shoot123" });

    expect(mockAggregatePipeline.lookup).toHaveBeenCalled();
  });

  it("includes clubId in the shoot aggregation result", async () => {
    mockFormatResponse.mockResolvedValue({});

    await getShoot({ shootId: "shoot123" });

    expect(mockAggregatePipeline.group).toHaveBeenCalledWith(
      expect.objectContaining({
        clubId: { $first: "$clubId" },
      }),
    );
  });

  it("should format response", async () => {
    const mockData = {
      _id: "shoot123",
      mode: "yellow",
      participants: [],
    };

    mockFormatResponse.mockResolvedValue(mockData);

    const result = await getShoot({ shootId: "shoot123" });

    expect(mockFormatResponse).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it("should return shoot with participants and scores", async () => {
    const mockShoot = {
      id: "shoot123",
      mode: "yellow",
      createdBy: "user123",
      completed: false,
      participants: [
        {
          user: "user123",
          userInfo: { name: "Test User" },
          roundScores: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
          totalScore: 55,
        },
        {
          user: "user456",
          userInfo: { name: "Another User" },
          roundScores: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
          totalScore: 90,
        },
      ],
    };

    mockFormatResponse.mockResolvedValue(mockShoot);

    const result = await getShoot({ shootId: "shoot123" });

    expect(result).toEqual(mockShoot);
    expect(result.participants).toHaveLength(2);
  });

  it("should handle shoot with no participants", async () => {
    const mockShoot = {
      id: "shoot123",
      mode: "yellow",
      participants: [],
    };

    mockFormatResponse.mockResolvedValue(mockShoot);

    const result = await getShoot({ shootId: "shoot123" });

    expect(result.participants).toEqual([]);
  });

  it("should handle completed shoot", async () => {
    const mockShoot = {
      id: "shoot123",
      mode: "red",
      completed: true,
      notes: "Great session",
      participants: [],
    };

    mockFormatResponse.mockResolvedValue(mockShoot);

    const result = await getShoot({ shootId: "shoot123" });

    expect(result.completed).toBe(true);
    expect(result.notes).toBe("Great session");
  });

  it("should work with different shoot IDs", async () => {
    mockFormatResponse.mockResolvedValue({});

    await getShoot({ shootId: "shoot123" });
    await getShoot({ shootId: "shoot456" });

    expect(mockConnectMongoose).toHaveBeenCalledTimes(2);
  });

  it("should handle different modes", async () => {
    const yellowShoot = { id: "shoot1", mode: "yellow" };
    const redShoot = { id: "shoot2", mode: "red" };

    mockFormatResponse
      .mockResolvedValueOnce(yellowShoot)
      .mockResolvedValueOnce(redShoot);

    const result1 = await getShoot({ shootId: "shoot1" });
    const result2 = await getShoot({ shootId: "shoot2" });

    expect(result1.mode).toBe("yellow");
    expect(result2.mode).toBe("red");
  });
});
