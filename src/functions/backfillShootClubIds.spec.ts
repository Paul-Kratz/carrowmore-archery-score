const mockConnectMongoose = jest.fn();
const mockShootUpdateMany = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  Shoot: {
    updateMany: mockShootUpdateMany,
  },
}));

import { backfillShootClubIds } from "./backfillShootClubIds";

describe("backfillShootClubIds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets carrowmore as the default club for shoots without a club id", async () => {
    mockShootUpdateMany.mockResolvedValue({ matchedCount: 3, modifiedCount: 3 });

    const result = await backfillShootClubIds();

    expect(mockConnectMongoose).toHaveBeenCalled();
    expect(mockShootUpdateMany).toHaveBeenCalledWith(
      {
        $or: [{ clubId: { $exists: false } }, { clubId: null }],
      },
      {
        $set: { clubId: "carrowmore" },
      },
    );
    expect(result).toEqual({ matched: 3, modified: 3 });
  });

  it("allows a specific club id to be supplied", async () => {
    mockShootUpdateMany.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    const result = await backfillShootClubIds("other-club");

    expect(mockShootUpdateMany).toHaveBeenCalledWith(
      expect.any(Object),
      { $set: { clubId: "other-club" } },
    );
    expect(result).toEqual({ matched: 1, modified: 1 });
  });
});
