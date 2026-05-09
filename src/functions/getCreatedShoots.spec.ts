const mockConnectMongoose = jest.fn();
const mockShootAggregate = jest.fn();
const mockFormatResponseArray = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  Shoot: {
    aggregate: mockShootAggregate,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponseArray: mockFormatResponseArray,
}));

import { getCreatedShoots } from "./getCreatedShoots";

describe("getCreatedShoots", () => {
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
    mockFormatResponseArray.mockResolvedValue([]);

    await getCreatedShoots("user123");

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should call Shoot.aggregate", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getCreatedShoots("user123");

    expect(mockShootAggregate).toHaveBeenCalled();
  });

  it("should match shoots created by the user", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getCreatedShoots("user123");

    expect(mockAggregatePipeline.match).toHaveBeenCalled();
  });

  it("should lookup participants", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getCreatedShoots("user123");

    expect(mockAggregatePipeline.lookup).toHaveBeenCalled();
  });

  it("includes clubId in the shoot aggregation result", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getCreatedShoots("user123");

    expect(mockAggregatePipeline.group).toHaveBeenCalledWith(
      expect.objectContaining({
        clubId: { $first: "$clubId" },
      }),
    );
  });

  it("should format response array", async () => {
    const mockData = [
      {
        _id: "shoot1",
        mode: "yellow",
        participants: [],
      },
    ];

    mockFormatResponseArray.mockResolvedValue(mockData);

    const result = await getCreatedShoots("user123");

    expect(mockFormatResponseArray).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it("should return formatted shoots", async () => {
    const mockShoots = [
      {
        id: "shoot1",
        mode: "yellow",
        createdBy: "user123",
        participants: [
          {
            user: "user123",
            userInfo: { name: "Test User" },
            totalScore: 100,
          },
        ],
      },
    ];

    mockFormatResponseArray.mockResolvedValue(mockShoots);

    const result = await getCreatedShoots("user123");

    expect(result).toEqual(mockShoots);
  });

  it("should handle empty results", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    const result = await getCreatedShoots("user123");

    expect(result).toEqual([]);
  });

  it("should handle multiple shoots", async () => {
    const mockShoots = [
      { id: "shoot1", mode: "yellow", participants: [] },
      { id: "shoot2", mode: "red", participants: [] },
      { id: "shoot3", mode: "yellow", participants: [] },
    ];

    mockFormatResponseArray.mockResolvedValue(mockShoots);

    const result = await getCreatedShoots("user123");

    expect(result).toHaveLength(3);
    expect(result).toEqual(mockShoots);
  });

  it("should work with different user IDs", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getCreatedShoots("user456");
    await getCreatedShoots("user789");

    expect(mockConnectMongoose).toHaveBeenCalledTimes(2);
  });
});
