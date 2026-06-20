import { CLUBS } from "@/constants";
import { connectMongoose } from "@/lib/mongoose";
import {
  IDenormalizedParticipant,
  IDenormalizedScore,
  IShootDenormalized,
} from "@/models";
import { ShootDenormalized } from "@/models/denormalized/mongoose";
import { createHash } from "node:crypto";
import { model, models, Schema, Types } from "mongoose";

export type DenormalizeShootsResponse = {
  totalShoots: number;
  migratedShoots: number;
  matchedShoots: number;
  modifiedShoots: number;
  upsertedShoots: number;
};

const DENORMALIZED_SHOOT_SCHEMA_VERSION = 1;

type DenormalizeShootsOptions = {
  dryRun?: boolean;
};

type ObjectIdLike = {
  toString: () => string;
};

type LeanShoot = {
  _id: ObjectIdLike;
  createdBy: ObjectIdLike;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  clubId: string;
  notes?: string | null;
};

type LeanShootParticipant = {
  _id: ObjectIdLike;
  shoot: ObjectIdLike;
  user?: ObjectIdLike | null;
  guestName?: string | null;
  guestNameNormalized?: string | null;
  pegColor?: string | null;
  joinedAt: Date;
};

type LeanRoundScore = {
  _id: ObjectIdLike;
  shoot: ObjectIdLike;
  participant?: ObjectIdLike | null;
  user?: ObjectIdLike | null;
  roundNumber: number;
  score?: number | null;
  scoredAt?: Date | null;
};

const legacyShootSchema = new Schema(
  {},
  { collection: "shoots", strict: false },
);
const legacyParticipantSchema = new Schema(
  {},
  { collection: "shootparticipants", strict: false },
);
const legacyRoundScoreSchema = new Schema(
  {},
  { collection: "roundscores", strict: false },
);

const LegacyShoot =
  models.Shoot || model<LeanShoot>("Shoot", legacyShootSchema);
const LegacyShootParticipant =
  models.ShootParticipant ||
  model<LeanShootParticipant>("ShootParticipant", legacyParticipantSchema);
const LegacyRoundScore =
  models.RoundScore ||
  model<LeanRoundScore>("RoundScore", legacyRoundScoreSchema);

const toId = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (record._id) {
      return toId(record._id);
    }

    if (typeof record.id === "string") {
      return record.id;
    }
  }

  if (
    typeof value === "object" &&
    "toString" in value &&
    typeof value.toString === "function"
  ) {
    return value.toString();
  }

  return null;
};

const toObjectId = (value: unknown): Types.ObjectId => {
  const id = toId(value);

  if (!id) {
    throw new Error("Expected an ObjectId-compatible value");
  }

  return new Types.ObjectId(id);
};

const createStableScoreId = ({
  participantId,
  roundNumber,
}: {
  participantId: string;
  roundNumber: number;
}) => {
  const hex = createHash("sha1")
    .update(`${participantId}:${roundNumber}`)
    .digest("hex")
    .slice(0, 24);

  return new Types.ObjectId(hex);
};

const groupBy = <T>(
  values: T[],
  getKey: (value: T) => string | null,
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();

  values.forEach((value) => {
    const key = getKey(value);

    if (!key) {
      return;
    }

    grouped.set(key, [...(grouped.get(key) ?? []), value]);
  });

  return grouped;
};

const getParticipantScores = (
  participant: LeanShootParticipant,
  roundScores: LeanRoundScore[],
) => {
  const participantId = toId(participant._id);
  const participantUserId = toId(participant.user);

  return roundScores.filter((score) => {
    const scoreParticipantId = toId(score.participant);

    if (scoreParticipantId) {
      return scoreParticipantId === participantId;
    }

    return Boolean(participantUserId && toId(score.user) === participantUserId);
  });
};

const mapScores = (
  scores: LeanRoundScore[],
  totalStations: number,
  participantId: string,
): IDenormalizedScore[] => {
  const scoresByRound = new Map<number, LeanRoundScore>();

  scores.forEach((score) => {
    scoresByRound.set(score.roundNumber, score);
  });

  return Array.from({ length: totalStations }, (_, index) => {
    const roundNumber = index + 1;
    const score = scoresByRound.get(roundNumber);
    const scoreId = score
      ? toObjectId(score._id)
      : createStableScoreId({ participantId, roundNumber });

    return {
      _id: scoreId,
      roundNumber,
      score: score?.score ?? null,
      scoredAt: score?.scoredAt ?? null,
    };
  });
};

const mapParticipants = ({
  participants,
  roundScores,
  totalStations,
}: {
  participants: LeanShootParticipant[];
  roundScores: LeanRoundScore[];
  totalStations: number;
}): IDenormalizedParticipant[] => {
  return participants.map((participant) => {
    const participantId = toId(participant._id);
    const userId = toId(participant.user);

    if (!participantId) {
      throw new Error("Cannot denormalize participant without an _id");
    }

    const participantScores = getParticipantScores(participant, roundScores);
    const scores = mapScores(participantScores, totalStations, participantId);
    const totalScore = scores.reduce(
      (total, score) => total + (score.score ?? 0),
      0,
    );
    const scoredCount = scores.filter((score) => score.score !== null).length;

    return {
      _id: toObjectId(participant._id),
      id: participantId,
      user: userId ? toObjectId(userId) : null,
      guestName: participant.guestName ?? null,
      guestNameNormalized: participant.guestNameNormalized ?? null,
      pegColor: participant.pegColor ?? null,
      joinedAt: participant.joinedAt,
      scores,
      totalScore,
      scoredCount,
    };
  });
};

const getTotalStations = (shoot: LeanShoot, roundScores: LeanRoundScore[]) => {
  const clubStations = CLUBS[shoot.clubId]?.totalStations;

  if (clubStations) {
    return clubStations;
  }

  return roundScores.reduce(
    (maxRound, score) => Math.max(maxRound, score.roundNumber),
    0,
  );
};

const getFirstScoredAt = (roundScores: LeanRoundScore[]) => {
  return (
    roundScores
      .map((score) => score.scoredAt)
      .filter((scoredAt): scoredAt is Date => scoredAt instanceof Date)
      .sort((a, b) => a.getTime() - b.getTime())[0] ?? null
  );
};

const getCompletedAt = ({
  completed,
  updatedAt,
}: {
  completed: boolean;
  updatedAt: Date;
}) => {
  return completed ? updatedAt : null;
};

export const mapShootToDenormalized = ({
  shoot,
  participants,
  roundScores,
}: {
  shoot: LeanShoot;
  participants: LeanShootParticipant[];
  roundScores: LeanRoundScore[];
}): IShootDenormalized => {
  const shootId = toId(shoot._id);

  if (!shootId) {
    throw new Error("Cannot denormalize shoot without an _id");
  }

  const totalStations = getTotalStations(shoot, roundScores);
  const participantsMapped = mapParticipants({
    participants,
    roundScores,
    totalStations,
  });
  const participantCount = participantsMapped.length;
  const scoredCount = participantsMapped.reduce(
    (total, participant) => total + participant.scoredCount,
    0,
  );

  return {
    _id: toObjectId(shoot._id),
    id: shootId,
    schemaVersion: DENORMALIZED_SHOOT_SCHEMA_VERSION,
    createdBy: toObjectId(shoot.createdBy),
    clubId: shoot.clubId,
    totalStations,
    completed: shoot.completed,
    completedAt: getCompletedAt({
      completed: shoot.completed,
      updatedAt: shoot.updatedAt,
    }),
    notes: shoot.notes ?? null,
    firstScoredAt: getFirstScoredAt(roundScores),
    createdAt: shoot.createdAt,
    updatedAt: shoot.updatedAt,
    participantCount,
    scoredCount,
    totalScoreSlots: participantCount * totalStations,
    participants: participantsMapped,
  };
};

export async function denormalizeShoots({
  dryRun = false,
}: DenormalizeShootsOptions = {}): Promise<DenormalizeShootsResponse> {
  await connectMongoose();

  const shoots = (await LegacyShoot.find({}).lean()) as LeanShoot[];
  const shootIds = shoots.map((shoot) => shoot._id);
  const [participants, roundScores] = await Promise.all([
    LegacyShootParticipant.find({ shoot: { $in: shootIds } }).lean(),
    LegacyRoundScore.find({ shoot: { $in: shootIds } }).lean(),
  ]);

  const participantsByShoot = groupBy(
    participants as LeanShootParticipant[],
    (participant) => toId(participant.shoot),
  );
  const roundScoresByShoot = groupBy(
    roundScores as LeanRoundScore[],
    (roundScore) => toId(roundScore.shoot),
  );
  const denormalizedShoots = shoots.map((shoot) => {
    const shootId = toId(shoot._id);

    return mapShootToDenormalized({
      shoot,
      participants: shootId ? (participantsByShoot.get(shootId) ?? []) : [],
      roundScores: shootId ? (roundScoresByShoot.get(shootId) ?? []) : [],
    });
  });

  if (dryRun || denormalizedShoots.length === 0) {
    return {
      totalShoots: shoots.length,
      migratedShoots: denormalizedShoots.length,
      matchedShoots: 0,
      modifiedShoots: 0,
      upsertedShoots: 0,
    };
  }

  const result = await ShootDenormalized.bulkWrite(
    denormalizedShoots.map((shoot) => ({
      replaceOne: {
        filter: { _id: shoot._id },
        replacement: shoot,
        upsert: true,
      },
    })),
    { timestamps: false },
  );

  return {
    totalShoots: shoots.length,
    migratedShoots: denormalizedShoots.length,
    matchedShoots: result.matchedCount,
    modifiedShoots: result.modifiedCount,
    upsertedShoots: result.upsertedCount,
  };
}
