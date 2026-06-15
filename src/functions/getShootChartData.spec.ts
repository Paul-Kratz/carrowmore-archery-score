const mockConnectMongoose = jest.fn();
const mockShootDenormalizedFind = jest.fn();
const mockShootDenormalizedSort = jest.fn();
const mockShootDenormalizedLean = jest.fn();
const mockFormatResponseArray = jest.fn();

class MockObjectId {
  constructor(private readonly value: string) {}

  toString() {
    return this.value;
  }
}

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: MockObjectId,
  },
}));

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/denormalized/mongoose", () => ({
  ShootDenormalized: {
    find: mockShootDenormalizedFind,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponseArray: mockFormatResponseArray,
}));

import { getShootChartData } from "./getShootChartData";

describe("getShootChartData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShootDenormalizedLean.mockResolvedValue([]);
    mockShootDenormalizedSort.mockReturnValue({
      lean: mockShootDenormalizedLean,
    });
    mockShootDenormalizedFind.mockReturnValue({
      sort: mockShootDenormalizedSort,
    });
  });

  it("returns chart data for the current user's embedded participant", async () => {
    mockFormatResponseArray.mockReturnValue([]);

    await getShootChartData("507f1f77bcf86cd799439001");

    const [filter, projection] = mockShootDenormalizedFind.mock.calls[0];

    expect(mockConnectMongoose).toHaveBeenCalled();
    expect(filter["participants.userId"].toString()).toBe(
      "507f1f77bcf86cd799439001",
    );
    expect(projection).toMatchObject({
      clubId: 1,
      createdAt: 1,
      completed: 1,
      totalStations: 1,
      participants: {
        $elemMatch: {
          userId: expect.anything(),
        },
      },
    });
    expect(projection.participants.$elemMatch.userId.toString()).toBe(
      "507f1f77bcf86cd799439001",
    );
    expect(mockShootDenormalizedSort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(mockFormatResponseArray).toHaveBeenCalledWith([]);
  });

  it("maps the matched embedded participant to the chart data contract", async () => {
    const shoot = {
      _id: "shoot-1",
      clubId: "carrowmore",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      completed: true,
      totalStations: 10,
      participants: [
        {
          _id: "participant-1",
          userId: "507f1f77bcf86cd799439001",
          pegColor: "yellow",
          totalScore: 20,
          scoredCount: 1,
          scores: [{ _id: "score-1", roundNumber: 1, score: 20 }],
        },
      ],
    };

    mockShootDenormalizedLean.mockResolvedValue([shoot]);
    mockFormatResponseArray.mockReturnValue([{ id: "shoot-1" }]);

    await getShootChartData("507f1f77bcf86cd799439001");

    expect(mockFormatResponseArray).toHaveBeenCalledWith([
      {
        _id: "shoot-1",
        clubId: "carrowmore",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        completed: true,
        totalStations: 10,
        participant: shoot.participants[0],
      },
    ]);
  });
});
