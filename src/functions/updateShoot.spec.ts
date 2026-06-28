const mockConnectMongoose = jest.fn();
const mockShootDenormalizedUpdateOne = jest.fn();

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
    updateOne: mockShootDenormalizedUpdateOne,
  },
}));

import { updateShoot } from "./updateShoot";

describe("updateShoot", () => {
  const shootId = "507f1f77bcf86cd799439011";
  const userId = "507f1f77bcf86cd799439001";

  beforeEach(() => {
    jest.clearAllMocks();
    mockShootDenormalizedUpdateOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });
  });

  it("connects to mongoose", async () => {
    await updateShoot({
      shootId,
      userId,
      notes: "Test notes",
      completed: false,
    });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("updates only shoots created by the user", async () => {
    await updateShoot({
      shootId,
      userId,
      notes: "Great session today",
      completed: true,
    });

    expect(mockShootDenormalizedUpdateOne).toHaveBeenCalledWith(
      {
        _id: expect.objectContaining({ value: shootId }),
        createdBy: expect.objectContaining({ value: userId }),
      },
      {
        $set: expect.objectContaining({
          notes: "Great session today",
          completed: true,
          completedAt: expect.any(Date),
        }),
      },
    );
  });

  it("clears completedAt when marking a shoot incomplete", async () => {
    await updateShoot({
      shootId,
      userId,
      completed: false,
    });

    expect(mockShootDenormalizedUpdateOne).toHaveBeenCalledWith(
      expect.anything(),
      {
        $set: {
          completed: false,
          completedAt: null,
        },
      },
    );
  });

  it("updates notes without changing completed state when completed is omitted", async () => {
    await updateShoot({
      shootId,
      userId,
      notes: "",
    });

    expect(mockShootDenormalizedUpdateOne).toHaveBeenCalledWith(
      expect.anything(),
      {
        $set: {
          notes: "",
        },
      },
    );
  });

  it("returns the update result", async () => {
    const mockResult = { matchedCount: 0, modifiedCount: 0 };
    mockShootDenormalizedUpdateOne.mockResolvedValue(mockResult);

    const result = await updateShoot({
      shootId,
      userId,
      notes: "Test",
    });

    expect(result).toBe(mockResult);
  });
});
