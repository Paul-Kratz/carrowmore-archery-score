const mockConnectMongoose = jest.fn();
const mockUserFind = jest.fn();
const mockShootDenormalizedCreate = jest.fn();
const mockFormatResponse = jest.fn();

let objectIdCounter = 0;

class MockObjectId {
  readonly value: string;

  constructor(value?: string) {
    objectIdCounter += 1;
    this.value = value ?? `generated-object-id-${objectIdCounter}`;
  }

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
  User: {
    find: mockUserFind,
  },
  ShootDenormalized: {
    create: mockShootDenormalizedCreate,
  },
}));

jest.mock("@/helpers/formatResponse", () => ({
  formatResponse: mockFormatResponse,
}));

jest.mock("@/constants", () => ({
  getClubPegColors: (clubData: { pegColors: string[] }) => clubData.pegColors,
  CLUBS: {
    carrowmore: {
      totalStations: 10,
      pegColors: ["yellow", "red"],
    },
    marbleArchers: {
      totalStations: 14,
      pegColors: ["yellow", "blue", "black"],
    },
  },
}));

import { createNewShoot } from "./createNewShoot";

const USER_ID = "507f1f77bcf86cd799439001";
const USER_TWO_ID = "507f1f77bcf86cd799439002";
const USER_THREE_ID = "507f1f77bcf86cd799439003";
const SHOOT_ID = "507f1f77bcf86cd799439011";
const CLUB_ID = "carrowmore";

const createShoot = (
  input: Omit<Parameters<typeof createNewShoot>[0], "clubId"> & {
    clubId?: string;
  },
) => createNewShoot({ clubId: CLUB_ID, ...input });

describe("createNewShoot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    objectIdCounter = 0;
    const mockShoot = { _id: SHOOT_ID, createdBy: USER_ID };

    mockConnectMongoose.mockResolvedValue(undefined);
    mockUserFind.mockResolvedValue([{ _id: USER_ID }]);
    mockShootDenormalizedCreate.mockResolvedValue(mockShoot);
    mockFormatResponse.mockReturnValue(mockShoot);
  });

  it("connects to mongoose", async () => {
    await createShoot({
      userId: USER_ID,
      participants: [{ userId: USER_ID }],
    });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("creates one denormalized shoot document", async () => {
    mockUserFind.mockResolvedValue([{ _id: USER_ID }, { _id: USER_TWO_ID }]);

    const result = await createShoot({
      userId: USER_ID,
      participants: [{ userId: USER_ID }, { userId: USER_TWO_ID }],
    });

    expect(mockShootDenormalizedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: 1,
        createdBy: expect.objectContaining({ value: USER_ID }),
        clubId: CLUB_ID,
        totalStations: 10,
        completed: false,
        completedAt: null,
        notes: null,
        firstScoredAt: null,
        participantCount: 2,
        scoredCount: 0,
        totalScoreSlots: 20,
      }),
    );
    expect(mockShootDenormalizedCreate.mock.calls[0][0]).not.toHaveProperty(
      "mode",
    );
    expect(result).toEqual({ _id: SHOOT_ID, createdBy: USER_ID });
  });

  it("creates nested participant scores for all rounds", async () => {
    await createShoot({
      userId: USER_ID,
      participants: [{ userId: USER_ID }],
    });

    const shootDoc = mockShootDenormalizedCreate.mock.calls[0][0];

    expect(shootDoc.participants).toHaveLength(1);
    expect(shootDoc.participants[0]).toMatchObject({
      user: expect.objectContaining({ value: USER_ID }),
      guestName: null,
      pegColor: "yellow",
      totalScore: 0,
      scoredCount: 0,
    });
    expect(shootDoc.participants[0]._id).toEqual(expect.any(MockObjectId));
    expect(shootDoc.participants[0].scores).toHaveLength(10);
    expect(shootDoc.participants[0].scores[0]).toMatchObject({
      _id: expect.any(MockObjectId),
      roundNumber: 1,
      score: null,
      scoredAt: null,
    });
    expect(shootDoc.participants[0].scores[9]).toMatchObject({
      roundNumber: 10,
      score: null,
      scoredAt: null,
    });
  });

  it("creates shoots with station counts from other clubs", async () => {
    await createShoot({
      userId: USER_ID,
      participants: [{ userId: USER_ID }],
      clubId: "marbleArchers",
    });

    const shootDoc = mockShootDenormalizedCreate.mock.calls[0][0];

    expect(shootDoc.clubId).toBe("marbleArchers");
    expect(shootDoc.totalStations).toBe(14);
    expect(shootDoc.participants[0].scores).toHaveLength(14);
    expect(shootDoc.totalScoreSlots).toBe(14);
  });

  it("deduplicates participant IDs and always includes the creator", async () => {
    mockUserFind.mockResolvedValue([{ _id: USER_ID }, { _id: USER_TWO_ID }]);

    await createShoot({
      userId: USER_ID,
      participants: [
        { userId: USER_TWO_ID },
        { userId: USER_TWO_ID },
        { userId: USER_ID },
      ],
    });

    const shootDoc = mockShootDenormalizedCreate.mock.calls[0][0];

    expect(shootDoc.participants).toHaveLength(2);
    expect(
      shootDoc.participants.map((participant: { user: MockObjectId }) =>
        participant.user.toString(),
      ),
    ).toEqual([USER_TWO_ID, USER_ID]);
  });

  it("stores peg colors for explicit registered and guest participants", async () => {
    mockUserFind.mockResolvedValue([
      { _id: USER_ID, name: "Alice", email: "alice@example.com" },
      { _id: USER_TWO_ID, name: "Bob", email: "bob@example.com" },
    ]);

    await createShoot({
      userId: USER_ID,
      participants: [
        { userId: USER_ID, pegColor: "red" },
        { userId: USER_TWO_ID, pegColor: "yellow" },
        { guestName: "Charlie", pegColor: "red" },
      ],
    });

    const shootDoc = mockShootDenormalizedCreate.mock.calls[0][0];

    expect(shootDoc.participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user: expect.objectContaining({ value: USER_ID }),
          guestName: null,
          pegColor: "red",
        }),
        expect.objectContaining({
          user: expect.objectContaining({ value: USER_TWO_ID }),
          guestName: null,
          pegColor: "yellow",
        }),
        expect.objectContaining({
          user: null,
          guestName: "Charlie",
          guestNameNormalized: "charlie",
          pegColor: "red",
        }),
      ]),
    );
    expect(shootDoc.participantCount).toBe(3);
    expect(shootDoc.totalScoreSlots).toBe(30);
  });

  it("throws when a participant does not exist", async () => {
    mockUserFind.mockResolvedValue([{ _id: USER_ID }]);

    await expect(
      createShoot({
        userId: USER_ID,
        participants: [{ userId: USER_TWO_ID }],
      }),
    ).rejects.toThrow("One or more participant userIds do not exist");

    expect(mockShootDenormalizedCreate).not.toHaveBeenCalled();
  });

  it("rejects unknown club ids", async () => {
    await expect(
      createShoot({
        userId: USER_ID,
        participants: [{ userId: USER_ID }],
        clubId: "unknown-club",
      }),
    ).rejects.toThrow("Invalid clubId");

    expect(mockShootDenormalizedCreate).not.toHaveBeenCalled();
  });

  it("rejects peg colors not supported by the selected club", async () => {
    await expect(
      createShoot({
        userId: USER_ID,
        participants: [{ userId: USER_ID, pegColor: "blue" }],
      }),
    ).rejects.toThrow(
      "Participant peg colors are not supported by the selected club",
    );
  });

  it("rejects duplicate guest names after normalization", async () => {
    await expect(
      createShoot({
        userId: USER_ID,
        participants: [{ guestName: "Charlie" }, { guestName: " charlie " }],
      }),
    ).rejects.toThrow("Guest names must be unique");
  });

  it("rejects guest names that clash with registered participant labels", async () => {
    mockUserFind.mockResolvedValue([{ _id: USER_ID, name: "Charlie" }]);

    await expect(
      createShoot({
        userId: USER_ID,
        participants: [{ userId: USER_ID }, { guestName: "charlie" }],
      }),
    ).rejects.toThrow(
      "Guest names cannot match selected registered participant names",
    );
  });

  it("rejects overly long guest names", async () => {
    await expect(
      createShoot({
        userId: USER_ID,
        participants: [{ guestName: "x".repeat(51) }],
      }),
    ).rejects.toThrow("Guest names must be 50 characters or fewer");
  });

  it("formats the created shoot before returning", async () => {
    const mockShoot = { _id: SHOOT_ID, createdBy: USER_ID };
    const formattedShoot = { id: SHOOT_ID };

    mockShootDenormalizedCreate.mockResolvedValue(mockShoot);
    mockFormatResponse.mockReturnValue(formattedShoot);

    const result = await createShoot({
      userId: USER_ID,
      participants: [{ userId: USER_ID }],
    });

    expect(mockFormatResponse).toHaveBeenCalledWith(mockShoot);
    expect(result).toEqual(formattedShoot);
  });

  it("verifies all participants exist before creating a shoot", async () => {
    mockUserFind.mockResolvedValue([{ _id: USER_ID }, { _id: USER_TWO_ID }]);

    await createShoot({
      userId: USER_ID,
      participants: [{ userId: USER_TWO_ID }, { userId: USER_THREE_ID }],
    }).catch(() => {});

    expect(mockUserFind).toHaveBeenCalled();
    expect(mockShootDenormalizedCreate).not.toHaveBeenCalled();
  });
});
