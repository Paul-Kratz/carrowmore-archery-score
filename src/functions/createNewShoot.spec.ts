const mockConnectMongoose = jest.fn();
const mockUserFind = jest.fn();
const mockShootCreate = jest.fn();
const mockShootParticipantInsertMany = jest.fn();
const mockRoundScoreInsertMany = jest.fn();
const mockFormatResponse = jest.fn();

jest.mock("@/lib/mongoose", () => ({
  connectMongoose: mockConnectMongoose,
}));

jest.mock("@/models/mongoose", () => ({
  User: {
    find: mockUserFind,
  },
  Shoot: {
    create: mockShootCreate,
  },
  ShootParticipant: {
    insertMany: mockShootParticipantInsertMany,
  },
  RoundScore: {
    insertMany: mockRoundScoreInsertMany,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponse: mockFormatResponse,
}));

jest.mock("@/constants", () => ({
  NUM_STATIONS: 10,
}));

import { createNewShoot } from "./createNewShoot";

describe("createNewShoot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to mongoose", async () => {
    const mockUsers = [{ _id: "user1" }, { _id: "user2" }];
    const mockShoot = { _id: "shoot1", mode: "yellow", createdBy: "user1" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: ["user2"],
    });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should create shoot with yellow mode", async () => {
    const mockUsers = [{ _id: "user1" }];
    const mockShoot = { _id: "shoot1", mode: "yellow", createdBy: "user1" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    const result = await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: [],
    });

    expect(mockShootCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "yellow",
        completed: false,
      }),
    );
    expect(result).toEqual(mockShoot);
  });

  it("should create shoot with red mode", async () => {
    const mockUsers = [{ _id: "user1" }];
    const mockShoot = { _id: "shoot1", mode: "red", createdBy: "user1" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: "user1",
      mode: "red",
      participantIds: [],
    });

    expect(mockShootCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "red",
      }),
    );
  });

  it("should include userId in participants list", async () => {
    const mockUsers = [{ _id: "user1" }, { _id: "user2" }];
    const mockShoot = { _id: "shoot1", mode: "yellow", createdBy: "user1" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: ["user2"],
    });

    expect(mockShootParticipantInsertMany).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ shoot: "shoot1" })]),
    );
    expect(mockShootParticipantInsertMany.mock.calls[0][0]).toHaveLength(2);
  });

  it("should deduplicate participant IDs", async () => {
    const mockUsers = [{ _id: "user1" }, { _id: "user2" }];
    const mockShoot = { _id: "shoot1", mode: "yellow", createdBy: "user1" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: ["user2", "user2", "user1"],
    });

    // Should only have 2 unique participants
    expect(mockShootParticipantInsertMany.mock.calls[0][0]).toHaveLength(2);
  });

  it("should throw error if participant does not exist", async () => {
    const mockUsers = [{ _id: "user1" }];

    mockUserFind.mockResolvedValue(mockUsers);

    await expect(
      createNewShoot({
        userId: "user1",
        mode: "yellow",
        participantIds: ["nonexistent"],
      }),
    ).rejects.toThrow("One or more participant userIds do not exist");
  });

  it("should create round scores for all participants and rounds", async () => {
    const mockUsers = [{ _id: "user1" }, { _id: "user2" }];
    const mockShoot = { _id: "shoot1", mode: "yellow", createdBy: "user1" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: ["user2"],
    });

    // 2 participants * 10 rounds = 20 round scores
    expect(mockRoundScoreInsertMany.mock.calls[0][0]).toHaveLength(20);
  });

  it("should create round scores with correct structure", async () => {
    const mockUsers = [{ _id: "user1" }];
    const mockShoot = { _id: "shoot1", mode: "yellow", createdBy: "user1" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: [],
    });

    const roundScores = mockRoundScoreInsertMany.mock.calls[0][0];
    expect(roundScores[0]).toMatchObject({
      shoot: "shoot1",
      roundNumber: 1,
      score: null,
    });
    expect(roundScores[9]).toMatchObject({
      roundNumber: 10,
      score: null,
    });
  });

  it("should format response before returning", async () => {
    const mockUsers = [{ _id: "user1" }];
    const mockShoot = { _id: "shoot1", mode: "yellow", createdBy: "user1" };
    const formattedShoot = { id: "shoot1", mode: "yellow" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue(mockShoot);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(formattedShoot);

    const result = await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: [],
    });

    expect(mockFormatResponse).toHaveBeenCalledWith(mockShoot);
    expect(result).toEqual(formattedShoot);
  });

  it("should verify all participants exist before creating shoot", async () => {
    const mockUsers = [{ _id: "user1" }, { _id: "user2" }];

    mockUserFind.mockResolvedValue(mockUsers);

    await createNewShoot({
      userId: "user1",
      mode: "yellow",
      participantIds: ["user2", "user3"],
    }).catch(() => {});

    expect(mockUserFind).toHaveBeenCalled();
    expect(mockShootCreate).not.toHaveBeenCalled();
  });
});
