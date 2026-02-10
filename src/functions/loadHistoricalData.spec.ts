const mockShootCreate = jest.fn();
const mockShootParticipantCreate = jest.fn();
const mockRoundScoreCreate = jest.fn();
const mockStartSession = jest.fn();

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    startSession: mockStartSession,
    Types: {
      ObjectId: jest.fn((id) => id),
    },
  },
}));

jest.mock("@/models/mongoose", () => ({
  Shoot: {
    create: mockShootCreate,
  },
  ShootParticipant: {
    create: mockShootParticipantCreate,
  },
  RoundScore: {
    create: mockRoundScoreCreate,
  },
}));

import { loadHistoricalData } from "./loadHistoricalData";

describe("loadHistoricalData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStartSession.mockResolvedValue(mockSession);
  });

  it("should start and commit a transaction", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [],
      },
    ];

    mockShootCreate.mockResolvedValue([{ _id: "shoot1" }]);

    await loadHistoricalData(shoots);

    expect(mockStartSession).toHaveBeenCalled();
    expect(mockSession.startTransaction).toHaveBeenCalled();
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it("should create shoots with correct data", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01T10:00:00Z",
        createdBy: "user1",
        completed: false,
        participants: [],
      },
    ];

    mockShootCreate.mockResolvedValue([{ _id: "shoot1" }]);

    const result = await loadHistoricalData(shoots);

    expect(mockShootCreate).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          mode: "yellow",
          completed: false,
        }),
      ],
      { session: mockSession },
    );
    expect(result.shootsCreated).toBe(1);
  });

  it("should create participants for each shoot", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [
          {
            user: "user1",
            joinedAt: "2024-01-01T10:00:00Z",
            roundScores: [10, 9, 8],
          },
          {
            user: "user2",
            joinedAt: "2024-01-01T10:05:00Z",
            roundScores: [9, 8, 7],
          },
        ],
      },
    ];

    mockShootCreate.mockResolvedValue([{ _id: "shoot1" }]);
    mockShootParticipantCreate.mockResolvedValue([{}]);
    mockRoundScoreCreate.mockResolvedValue([{}]);

    const result = await loadHistoricalData(shoots);

    expect(mockShootParticipantCreate).toHaveBeenCalledTimes(2);
    expect(result.participantsCreated).toBe(2);
  });

  it("should create round scores for each participant", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [
          {
            user: "user1",
            joinedAt: "2024-01-01T10:00:00Z",
            roundScores: [10, 9, 8, 7, 6],
          },
        ],
      },
    ];

    mockShootCreate.mockResolvedValue([{ _id: "shoot1" }]);
    mockShootParticipantCreate.mockResolvedValue([{}]);
    mockRoundScoreCreate.mockResolvedValue([{}]);

    const result = await loadHistoricalData(shoots);

    expect(mockRoundScoreCreate).toHaveBeenCalledTimes(5);
    expect(result.roundScoresCreated).toBe(5);
  });

  it("should create round scores with correct round numbers", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [
          {
            user: "user1",
            joinedAt: "2024-01-01T10:00:00Z",
            roundScores: [10, 9, 8],
          },
        ],
      },
    ];

    mockShootCreate.mockResolvedValue([{ _id: "shoot1" }]);
    mockShootParticipantCreate.mockResolvedValue([{}]);
    mockRoundScoreCreate.mockResolvedValue([{}]);

    await loadHistoricalData(shoots);

    expect(mockRoundScoreCreate).toHaveBeenNthCalledWith(
      1,
      [
        expect.objectContaining({
          roundNumber: 1,
          score: 10,
        }),
      ],
      { session: mockSession },
    );

    expect(mockRoundScoreCreate).toHaveBeenNthCalledWith(
      2,
      [
        expect.objectContaining({
          roundNumber: 2,
          score: 9,
        }),
      ],
      { session: mockSession },
    );
  });

  it("should handle multiple shoots", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [],
      },
      {
        mode: "red",
        createdAt: "2024-01-02",
        createdBy: "user2",
        completed: true,
        participants: [],
      },
    ];

    mockShootCreate.mockResolvedValue([{ _id: "shoot1" }]);

    const result = await loadHistoricalData(shoots);

    expect(result.shootsCreated).toBe(2);
  });

  it("should return correct statistics", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [
          {
            user: "user1",
            joinedAt: "2024-01-01T10:00:00Z",
            roundScores: [10, 9],
          },
          {
            user: "user2",
            joinedAt: "2024-01-01T10:00:00Z",
            roundScores: [8, 7],
          },
        ],
      },
    ];

    mockShootCreate.mockResolvedValue([{ _id: "shoot1" }]);
    mockShootParticipantCreate.mockResolvedValue([{}]);
    mockRoundScoreCreate.mockResolvedValue([{}]);

    const result = await loadHistoricalData(shoots);

    expect(result).toEqual({
      shootsCreated: 1,
      participantsCreated: 2,
      roundScoresCreated: 4,
    });
  });

  it("should abort transaction on error", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [],
      },
    ];

    mockShootCreate.mockRejectedValue(new Error("Database error"));

    await expect(loadHistoricalData(shoots)).rejects.toThrow("Database error");

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it("should end session even if transaction fails", async () => {
    const shoots = [
      {
        mode: "yellow",
        createdAt: "2024-01-01",
        createdBy: "user1",
        completed: false,
        participants: [],
      },
    ];

    mockShootCreate.mockRejectedValue(new Error("Database error"));

    await expect(loadHistoricalData(shoots)).rejects.toThrow();

    expect(mockSession.endSession).toHaveBeenCalled();
  });
});
