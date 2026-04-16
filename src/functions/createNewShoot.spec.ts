const mockConnectMongoose = jest.fn();
const mockUserFind = jest.fn();
const mockShootCreate = jest.fn();
const mockShootParticipantInsertMany = jest.fn();
const mockRoundScoreInsertMany = jest.fn();
const mockFormatResponse = jest.fn();
const mockStartTransaction = jest.fn();
const mockCommitTransaction = jest.fn();
const mockAbortTransaction = jest.fn();
const mockEndSession = jest.fn();
const mockStartSession = jest.fn().mockResolvedValue({
  startTransaction: mockStartTransaction,
  commitTransaction: mockCommitTransaction,
  abortTransaction: mockAbortTransaction,
  endSession: mockEndSession,
});

class MockObjectId {
  constructor(private readonly value: string) {}

  toString() {
    return this.value;
  }
}

jest.mock("mongoose", () => {
  return {
    __esModule: true,
    default: {
      startSession: mockStartSession,
    },
    Types: {
      ObjectId: MockObjectId,
    },
  };
});

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

const USER_ID = "507f1f77bcf86cd799439001";
const USER_TWO_ID = "507f1f77bcf86cd799439002";
const USER_THREE_ID = "507f1f77bcf86cd799439003";
const SHOOT_ID = "507f1f77bcf86cd799439011";

describe("createNewShoot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStartTransaction.mockReset();
    mockCommitTransaction.mockReset();
    mockAbortTransaction.mockReset();
    mockEndSession.mockReset();
  });

  it("should connect to mongoose", async () => {
    const mockUsers = [{ _id: USER_ID }, { _id: USER_TWO_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [USER_TWO_ID],
    });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("should create shoot with yellow mode", async () => {
    const mockUsers = [{ _id: USER_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    const result = await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [],
    });

    expect(mockShootCreate).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          mode: "yellow",
          completed: false,
        }),
      ],
      expect.objectContaining({
        session: expect.any(Object),
      }),
    );
    expect(result).toEqual(mockShoot);
  });

  it("should create shoot with red mode", async () => {
    const mockUsers = [{ _id: USER_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "red", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: USER_ID,
      mode: "red",
      participantIds: [],
    });

    expect(mockShootCreate).toHaveBeenCalledWith(
      [expect.objectContaining({ mode: "red" })],
      expect.objectContaining({
        session: expect.any(Object),
      }),
    );
  });

  it("should include userId in participants list", async () => {
    const mockUsers = [{ _id: USER_ID }, { _id: USER_TWO_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [USER_TWO_ID],
    });

    expect(mockShootParticipantInsertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ shoot: SHOOT_ID }),
      ]),
      expect.objectContaining({
        session: expect.any(Object),
      }),
    );
    expect(mockShootParticipantInsertMany.mock.calls[0][0]).toHaveLength(2);
  });

  it("should deduplicate participant IDs", async () => {
    const mockUsers = [{ _id: USER_ID }, { _id: USER_TWO_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [USER_TWO_ID, USER_TWO_ID, USER_ID],
    });

    // Should only have 2 unique participants
    expect(mockShootParticipantInsertMany.mock.calls[0][0]).toHaveLength(2);
  });

  it("should throw error if participant does not exist", async () => {
    const mockUsers = [{ _id: USER_ID }];

    mockUserFind.mockResolvedValue(mockUsers);

    await expect(
      createNewShoot({
        userId: USER_ID,
        mode: "yellow",
        participantIds: [USER_TWO_ID],
      }),
    ).rejects.toThrow("One or more participant userIds do not exist");
  });

  it("should create round scores for all participants and rounds", async () => {
    const mockUsers = [{ _id: USER_ID }, { _id: USER_TWO_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [USER_TWO_ID],
    });

    // 2 participants * 10 rounds = 20 round scores
    expect(mockRoundScoreInsertMany.mock.calls[0][0]).toHaveLength(20);
  });

  it("should create round scores with correct structure", async () => {
    const mockUsers = [{ _id: USER_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [],
    });

    const roundScores = mockRoundScoreInsertMany.mock.calls[0][0];
    expect(roundScores[0]).toMatchObject({
      shoot: SHOOT_ID,
      roundNumber: 1,
      score: null,
    });
    expect(roundScores[9]).toMatchObject({
      roundNumber: 10,
      score: null,
    });
  });

  it("creates guest participants and participant-based round scores", async () => {
    const mockUsers = [
      { _id: USER_ID, name: "Alice", email: "alice@example.com" },
      { _id: USER_TWO_ID, name: "Bob", email: "bob@example.com" },
    ];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(mockShoot);

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [USER_TWO_ID],
      guestNames: ["Charlie"],
    });

    const participantDocs = mockShootParticipantInsertMany.mock.calls[0][0];
    expect(participantDocs).toHaveLength(3);
    expect(participantDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          guestName: "Charlie",
          guestNameNormalized: "charlie",
        }),
      ]),
    );

    const roundScoreDocs = mockRoundScoreInsertMany.mock.calls[0][0];
    expect(roundScoreDocs).toHaveLength(30);
    expect(
      roundScoreDocs.some(
        (score: { participant?: string; user?: string }) =>
          score.participant && !score.user,
      ),
    ).toBe(true);
  });

  it("rejects duplicate guest names after normalization", async () => {
    await expect(
      createNewShoot({
        userId: USER_ID,
        mode: "yellow",
        participantIds: [],
        guestNames: ["Charlie", " charlie "],
      }),
    ).rejects.toThrow("Guest names must be unique");
  });

  it("rejects guest names that clash with registered participant labels", async () => {
    const mockUsers = [{ _id: USER_ID, name: "Charlie", email: null }];
    mockUserFind.mockResolvedValue(mockUsers);

    await expect(
      createNewShoot({
        userId: USER_ID,
        mode: "yellow",
        participantIds: [],
        guestNames: ["charlie"],
      }),
    ).rejects.toThrow(
      "Guest names cannot match selected registered participant names",
    );
  });

  it("rejects overly long guest names", async () => {
    await expect(
      createNewShoot({
        userId: USER_ID,
        mode: "yellow",
        participantIds: [],
        guestNames: ["x".repeat(51)],
      }),
    ).rejects.toThrow("Guest names must be 50 characters or fewer");
  });

  it("should format response before returning", async () => {
    const mockUsers = [{ _id: USER_ID }];
    const mockShoot = { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID };
    const formattedShoot = { id: SHOOT_ID, mode: "yellow" };

    mockUserFind.mockResolvedValue(mockUsers);
    mockShootCreate.mockResolvedValue([mockShoot]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue(formattedShoot);

    const result = await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [],
    });

    expect(mockFormatResponse).toHaveBeenCalledWith(mockShoot);
    expect(result).toEqual(formattedShoot);
  });

  it("should verify all participants exist before creating shoot", async () => {
    const mockUsers = [{ _id: USER_ID }, { _id: USER_TWO_ID }];

    mockUserFind.mockResolvedValue(mockUsers);

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [USER_TWO_ID, USER_THREE_ID],
    }).catch(() => {});

    expect(mockUserFind).toHaveBeenCalled();
    expect(mockShootCreate).not.toHaveBeenCalled();
  });

  it("commits the transaction on success", async () => {
    mockUserFind.mockResolvedValue([{ _id: USER_ID }]);
    mockShootCreate.mockResolvedValue([
      { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID },
    ]);
    mockShootParticipantInsertMany.mockResolvedValue([]);
    mockRoundScoreInsertMany.mockResolvedValue([]);
    mockFormatResponse.mockReturnValue({ id: "shoot1" });

    await createNewShoot({
      userId: USER_ID,
      mode: "yellow",
      participantIds: [],
    });

    expect(mockStartTransaction).toHaveBeenCalled();
    expect(mockCommitTransaction).toHaveBeenCalled();
    expect(mockAbortTransaction).not.toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });

  it("aborts the transaction if a write fails", async () => {
    mockUserFind.mockResolvedValue([{ _id: USER_ID }]);
    mockShootCreate.mockResolvedValue([
      { _id: SHOOT_ID, mode: "yellow", createdBy: USER_ID },
    ]);
    mockShootParticipantInsertMany.mockRejectedValue(new Error("Write failed"));

    await expect(
      createNewShoot({
        userId: USER_ID,
        mode: "yellow",
        participantIds: [],
      }),
    ).rejects.toThrow("Write failed");

    expect(mockAbortTransaction).toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });
});
