const mockConnectMongoose = jest.fn();
const mockShootDenormalizedDeleteOne = jest.fn();

class MockObjectId {
  constructor(private readonly value: string) {}

  toString() {
    return this.value;
  }
}

jest.mock("mongoose", () => {
  return {
    __esModule: true,
    Types: {
      ObjectId: MockObjectId,
    },
  };
});

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  ShootDenormalized: {
    deleteOne: mockShootDenormalizedDeleteOne,
  },
}));

import { deleteShoot } from "./deleteShoot";

describe("deleteShoot", () => {
  const shootId = "507f1f77bcf86cd799439011";
  const userId = "507f1f77bcf86cd799439012";

  beforeEach(() => {
    jest.clearAllMocks();
    mockShootDenormalizedDeleteOne.mockResolvedValue({ deletedCount: 1 });
  });

  it("connects to mongoose", async () => {
    await deleteShoot({ shootId, userId });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("deletes only shoots created by the user", async () => {
    await deleteShoot({ shootId, userId });

    expect(mockShootDenormalizedDeleteOne).toHaveBeenCalledWith({
      _id: expect.any(MockObjectId),
      createdBy: expect.any(MockObjectId),
    });
    expect(mockShootDenormalizedDeleteOne.mock.calls[0][0]._id.toString()).toBe(
      shootId,
    );
    expect(
      mockShootDenormalizedDeleteOne.mock.calls[0][0].createdBy.toString(),
    ).toBe(userId);
  });

  it("returns the delete result", async () => {
    mockShootDenormalizedDeleteOne.mockResolvedValue({ deletedCount: 0 });

    await expect(deleteShoot({ shootId, userId })).resolves.toEqual({
      deletedCount: 0,
    });
  });

  it("propagates delete failures", async () => {
    mockShootDenormalizedDeleteOne.mockRejectedValue(
      new Error("Delete failed"),
    );

    await expect(deleteShoot({ shootId, userId })).rejects.toThrow(
      "Delete failed",
    );
  });
});
