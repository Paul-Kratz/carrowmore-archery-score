const mockConnectMongoose = jest.fn();
const mockShootDenormalizedFindOne = jest.fn();

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
    findOne: mockShootDenormalizedFindOne,
  },
}));

import { updateRound } from "./updateRound";

type Score = {
  _id: { toString: () => string };
  roundNumber: number;
  score: number | null;
  scoredAt?: Date | null;
};

type Participant = {
  _id: { toString: () => string };
  scores: Score[];
  totalScore: number;
  scoredCount: number;
};

const shootId = "507f1f77bcf86cd799439011";
const userId = "507f1f77bcf86cd799439001";
const participantId = "507f1f77bcf86cd799439012";

const makeShoot = ({
  participants = [
    {
      _id: { toString: () => participantId },
      scores: [
        {
          _id: { toString: () => "507f1f77bcf86cd799439021" },
          roundNumber: 1,
          score: null,
          scoredAt: null,
        },
        {
          _id: { toString: () => "507f1f77bcf86cd799439022" },
          roundNumber: 2,
          score: 5,
          scoredAt: new Date("2024-01-02T00:00:00.000Z"),
        },
      ],
      totalScore: 5,
      scoredCount: 1,
    },
  ],
}: {
  participants?: Participant[];
} = {}) => ({
  participants,
  scoredCount: participants.reduce(
    (total, participant) => total + participant.scoredCount,
    0,
  ),
  firstScoredAt: null as Date | null,
  save: jest.fn().mockResolvedValue(undefined),
});

describe("updateRound", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectMongoose.mockResolvedValue(undefined);
  });

  it("connects to mongoose", async () => {
    mockShootDenormalizedFindOne.mockResolvedValue(makeShoot());

    await updateRound({
      participantId,
      shootId,
      userId,
      roundNumber: 1,
      score: 10,
    });

    expect(mockConnectMongoose).toHaveBeenCalled();
  });

  it("loads only shoots created by the user", async () => {
    mockShootDenormalizedFindOne.mockResolvedValue(makeShoot());

    await updateRound({
      participantId,
      shootId,
      userId,
      roundNumber: 1,
      score: 10,
    });

    expect(mockShootDenormalizedFindOne).toHaveBeenCalledWith({
      _id: expect.objectContaining({ value: shootId }),
      createdBy: expect.objectContaining({ value: userId }),
    });
  });

  it("updates a nested score and recalculates participant and shoot totals", async () => {
    const shoot = makeShoot();
    mockShootDenormalizedFindOne.mockResolvedValue(shoot);

    const result = await updateRound({
      participantId,
      shootId,
      userId,
      roundNumber: 1,
      score: 10,
    });

    expect(shoot.participants[0].scores[0].score).toBe(10);
    expect(shoot.participants[0].scores[0].scoredAt).toEqual(expect.any(Date));
    expect(shoot.participants[0].totalScore).toBe(15);
    expect(shoot.participants[0].scoredCount).toBe(2);
    expect(shoot.scoredCount).toBe(2);
    expect(shoot.firstScoredAt).toEqual(new Date("2024-01-02T00:00:00.000Z"));
    expect(shoot.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ matchedCount: 1, modifiedCount: 1 });
  });

  it("clears a nested score and recalculates totals", async () => {
    const shoot = makeShoot();
    mockShootDenormalizedFindOne.mockResolvedValue(shoot);

    const result = await updateRound({
      participantId,
      shootId,
      userId,
      roundNumber: 2,
      score: null,
    });

    expect(shoot.participants[0].scores[1].score).toBeNull();
    expect(shoot.participants[0].scores[1].scoredAt).toBeNull();
    expect(shoot.participants[0].totalScore).toBe(0);
    expect(shoot.participants[0].scoredCount).toBe(0);
    expect(shoot.scoredCount).toBe(0);
    expect(shoot.firstScoredAt).toBeNull();
    expect(shoot.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ matchedCount: 1, modifiedCount: 1 });
  });

  it("returns a zero-match result when the shoot is missing or forbidden", async () => {
    mockShootDenormalizedFindOne.mockResolvedValue(null);

    const result = await updateRound({
      participantId,
      shootId,
      userId,
      roundNumber: 1,
      score: 10,
    });

    expect(result).toEqual({ matchedCount: 0, modifiedCount: 0 });
  });

  it("returns a zero-match result when the participant is missing", async () => {
    const shoot = makeShoot({ participants: [] });
    mockShootDenormalizedFindOne.mockResolvedValue(shoot);

    const result = await updateRound({
      participantId,
      shootId,
      userId,
      roundNumber: 1,
      score: 10,
    });

    expect(result).toEqual({ matchedCount: 0, modifiedCount: 0 });
    expect(shoot.save).not.toHaveBeenCalled();
  });

  it("returns a zero-match result when the round is missing", async () => {
    const shoot = makeShoot();
    mockShootDenormalizedFindOne.mockResolvedValue(shoot);

    const result = await updateRound({
      participantId,
      shootId,
      userId,
      roundNumber: 99,
      score: 10,
    });

    expect(result).toEqual({ matchedCount: 0, modifiedCount: 0 });
    expect(shoot.save).not.toHaveBeenCalled();
  });

  it("rejects when mongoose connection fails", async () => {
    mockConnectMongoose.mockRejectedValue(new Error("Connection failed"));

    await expect(
      updateRound({
        participantId,
        shootId,
        userId,
        roundNumber: 1,
        score: 10,
      }),
    ).rejects.toThrow("Connection failed");
  });
});
