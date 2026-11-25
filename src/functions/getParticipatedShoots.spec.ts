const mockConnectMongoose = jest.fn();
const mockShootDenormalizedFind = jest.fn();
const mockShootDenormalizedSort = jest.fn();
const mockShootDenormalizedPopulate = jest.fn();
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

jest.mock("@/models/mongoose", () => ({
  ShootDenormalized: {
    find: mockShootDenormalizedFind,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponseArray: mockFormatResponseArray,
}));

import { getParticipatedShoots } from "./getParticipatedShoots";
import { createTestShootData } from "@/testFixtures/shoot";

describe("getParticipatedShoots", () => {
  const userId = "507f1f77bcf86cd799439001";

  beforeEach(() => {
    jest.clearAllMocks();
    mockShootDenormalizedLean.mockResolvedValue([]);
    mockShootDenormalizedPopulate.mockReturnValue({
      lean: mockShootDenormalizedLean,
    });
    mockShootDenormalizedSort.mockReturnValue({
      populate: mockShootDenormalizedPopulate,
    });
    mockShootDenormalizedFind.mockReturnValue({
      sort: mockShootDenormalizedSort,
    });
    mockFormatResponseArray.mockReturnValue([]);
  });

  it("connects to mongoose", async () => {
    await getParticipatedShoots(userId);

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("loads denormalized shoots where the user participated", async () => {
    await getParticipatedShoots(userId);

    const [query] = mockShootDenormalizedFind.mock.calls[0];

    expect(query["participants.user"].toString()).toBe(userId);
    expect(mockShootDenormalizedSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockShootDenormalizedPopulate).toHaveBeenCalledWith({
      path: "participants.user",
      select: "name",
    });
    expect(mockShootDenormalizedLean).toHaveBeenCalled();
  });

  it("formats the denormalized shoot list", async () => {
    const shoots = [
      {
        _id: "shoot-1",
        participants: [
          {
            user: userId,
            scores: [{ roundNumber: 1, score: 10 }],
            totalScore: 10,
          },
        ],
      },
    ];
    const formattedShoots = [{ id: "shoot-1", createdBy: userId, participants: [] }];

    mockShootDenormalizedLean.mockResolvedValue(shoots);
    mockFormatResponseArray.mockReturnValue(formattedShoots);

    const result = await getParticipatedShoots(userId);

    expect(mockFormatResponseArray).toHaveBeenCalledWith(shoots);
    expect(result).toEqual(formattedShoots);
  });

  it("strips other participants' scores from history responses but keeps own scores and group totals", async () => {
    const fixture = createTestShootData({ createdBy: "other-tracker" });
    const shoot = { ...fixture, participants: [
      { ...fixture.participants[0], user: userId },
      { ...fixture.participants[0], id: "other", user: "other-tracker", totalScore: 18 },
    ] };
    mockFormatResponseArray.mockReturnValue([shoot]);
    const result = await getParticipatedShoots(userId);
    expect(result[0].participants[0].scores).toHaveLength(2);
    expect(result[0].participants[1].scores).toEqual([]);
    expect(result[0].participants[1].totalScore).toBe(18);
    expect(result[0].participants[1].scoredCount).toBe(1);
  });
});
