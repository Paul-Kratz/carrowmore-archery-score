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

import { IShootWithParticipants } from "@/models";
import { getParticipatedShoots } from "./getParticipatedShoots";

describe("getParticipatedShoots", () => {
  const mockAggregatePipeline = {
    lookup: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
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

    await getParticipatedShoots("user123");

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should call Shoot.aggregate", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getParticipatedShoots("user123");

    expect(mockShootAggregate).toHaveBeenCalled();
  });

  it("should match shoots where user participated", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getParticipatedShoots("user123");

    expect(mockAggregatePipeline.match).toHaveBeenCalled();
  });

  it("should lookup participants and round scores", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getParticipatedShoots("user123");

    expect(mockAggregatePipeline.lookup).toHaveBeenCalled();
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

    const result = await getParticipatedShoots("user123");

    expect(mockFormatResponseArray).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it("should return formatted shoots with round scores", async () => {
    const mockShoots = [
      {
        id: "shoot1",
        mode: "yellow",
        participants: [
          {
            user: "user123",
            userInfo: { name: "Test User" },
            roundScores: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
            totalScore: 55,
          },
        ],
      },
    ] as unknown as IShootWithParticipants[];

    mockFormatResponseArray.mockResolvedValue(mockShoots);

    const result = (await getParticipatedShoots(
      "user123",
    )) as unknown as IShootWithParticipants[];

    expect(result).toEqual(mockShoots);
    expect(result[0].participants[0].roundScores).toHaveLength(10);
  });

  it("should handle empty results", async () => {
    mockFormatResponseArray.mockResolvedValue([] as IShootWithParticipants[]);

    const result = await getParticipatedShoots("user123");

    expect(result).toEqual([]);
  });

  it("should handle multiple shoots", async () => {
    const mockShoots = [
      { id: "shoot1", mode: "yellow", participants: [] },
      { id: "shoot2", mode: "red", participants: [] },
    ];

    mockFormatResponseArray.mockResolvedValue(
      mockShoots as unknown as IShootWithParticipants[],
    );

    const result = await getParticipatedShoots("user123");

    expect(result).toHaveLength(2);
  });

  it("should include shoots from different creators", async () => {
    const mockShoots = [
      { id: "shoot1", createdBy: "user456", participants: [] },
      { id: "shoot2", createdBy: "user789", participants: [] },
    ];

    mockFormatResponseArray.mockResolvedValue(
      mockShoots as unknown as IShootWithParticipants[],
    );

    const result = await getParticipatedShoots("user123");

    expect(result).toHaveLength(2);
  });

  it("should work with different user IDs", async () => {
    mockFormatResponseArray.mockResolvedValue([]);

    await getParticipatedShoots("user456");
    await getParticipatedShoots("user789");

    expect(mockConnectMongoose).toHaveBeenCalledTimes(2);
  });
});
