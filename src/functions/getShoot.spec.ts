const mockConnectMongoose = jest.fn();
const mockFindById = jest.fn();
const mockPopulate = jest.fn();
const mockLean = jest.fn();
const mockFormatResponse = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  ShootDenormalized: {
    findById: mockFindById,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponse: mockFormatResponse,
}));

import { getShoot, getShootWithAccess } from "./getShoot";

describe("getShoot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindById.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
  });

  it("connects to mongoose", async () => {
    mockLean.mockResolvedValue(null);
    mockFormatResponse.mockReturnValue(null);

    await getShoot({ shootId: "shoot123" });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("loads the denormalized shoot by ID", async () => {
    mockLean.mockResolvedValue(null);
    mockFormatResponse.mockReturnValue(null);

    await getShoot({ shootId: "shoot123" });

    expect(mockFindById).toHaveBeenCalledWith("shoot123");
  });

  it("populates participant users", async () => {
    mockLean.mockResolvedValue(null);
    mockFormatResponse.mockReturnValue(null);

    await getShoot({ shootId: "shoot123" });

    expect(mockPopulate).toHaveBeenCalledWith({
      path: "participants.user",
      select: "name email",
    });
  });

  it("formats the denormalized shoot response", async () => {
    const mockShoot = {
      _id: "shoot123",
      participants: [],
    };
    const mockFormattedShoot = {
      id: "shoot123",
      participants: [],
    };

    mockLean.mockResolvedValue(mockShoot);
    mockFormatResponse.mockReturnValue(mockFormattedShoot);

    const result = await getShoot({ shootId: "shoot123" });

    expect(mockFormatResponse).toHaveBeenCalledWith(mockShoot);
    expect(result).toEqual(mockFormattedShoot);
  });
});

describe("getShootWithAccess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindById.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
  });

  it("returns missing access when the shoot does not exist", async () => {
    mockLean.mockResolvedValue(null);

    const result = await getShootWithAccess({
      shootId: "shoot123",
      userId: "user123",
    });

    expect(result).toEqual({
      exists: false,
      isCreator: false,
      isParticipant: false,
      shoot: null,
    });
  });

  it("detects creator access", async () => {
    mockLean.mockResolvedValue({
      createdBy: { toString: () => "user123" },
      participants: [],
    });

    const result = await getShootWithAccess({
      shootId: "shoot123",
      userId: "user123",
    });

    expect(result.exists).toBe(true);
    expect(result.isCreator).toBe(true);
    expect(result.isParticipant).toBe(false);
  });

  it("detects participant access for populated users", async () => {
    mockLean.mockResolvedValue({
      createdBy: { toString: () => "creator123" },
      participants: [
        {
          user: {
            _id: { toString: () => "user123" },
            name: "Pat",
          },
        },
      ],
    });

    const result = await getShootWithAccess({
      shootId: "shoot123",
      userId: "user123",
    });

    expect(result.exists).toBe(true);
    expect(result.isCreator).toBe(false);
    expect(result.isParticipant).toBe(true);
    expect(result.shoot?.participants[0].user.name).toBe("Pat");
  });

  it("populates participant users for the returned shoot", async () => {
    mockLean.mockResolvedValue({
      createdBy: { toString: () => "creator123" },
      participants: [],
    });

    await getShootWithAccess({
      shootId: "shoot123",
      userId: "user123",
    });

    expect(mockPopulate).toHaveBeenCalledWith({
      path: "participants.user",
      select: "name email",
    });
  });
});
