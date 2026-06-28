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

import { getCreatedShoots } from "./getCreatedShoots";

describe("getCreatedShoots", () => {
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
    await getCreatedShoots(userId);

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("loads denormalized shoots created by the user", async () => {
    await getCreatedShoots(userId);

    const [query] = mockShootDenormalizedFind.mock.calls[0];

    expect(query.createdBy.toString()).toBe(userId);
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
        createdBy: userId,
        participants: [],
      },
    ];
    const formattedShoots = [{ id: "shoot-1", participants: [] }];

    mockShootDenormalizedLean.mockResolvedValue(shoots);
    mockFormatResponseArray.mockReturnValue(formattedShoots);

    const result = await getCreatedShoots(userId);

    expect(mockFormatResponseArray).toHaveBeenCalledWith(shoots);
    expect(result).toEqual(formattedShoots);
  });
});
