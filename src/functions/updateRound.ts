import { connectMongoose } from "@/lib/mongoose";
import { IDenormalizedParticipant, IDenormalizedScore } from "@/models";
import { ShootDenormalized } from "@/models/denormalized/mongoose";
import { Types } from "mongoose";

type UpdateRoundResult = {
  matchedCount: number;
  modifiedCount: number;
};

const zeroMatchResult = (): UpdateRoundResult => ({
  matchedCount: 0,
  modifiedCount: 0,
});

const getFirstScoredAt = (
  participants: { scores: IDenormalizedScore[] }[],
) => {
  return (
    participants
      .flatMap((participant) => participant.scores)
      .map((roundScore) => roundScore.scoredAt)
      .filter((scoredAt): scoredAt is Date => scoredAt instanceof Date)
      .sort((a, b) => a.getTime() - b.getTime())[0] ?? null
  );
};

export const updateRound = async ({
  participantId,
  shootId,
  userId,
  roundNumber,
  score,
}: {
  participantId: string;
  shootId: string;
  userId: string;
  roundNumber: number;
  score: number | null;
}): Promise<UpdateRoundResult> => {
  await connectMongoose();

  const shoot = await ShootDenormalized.findOne({
    _id: new Types.ObjectId(shootId),
    createdBy: new Types.ObjectId(userId),
  });

  if (!shoot) {
    return zeroMatchResult();
  }

  const participants = shoot.participants as IDenormalizedParticipant[];

  const participant = participants.find(
    (shootParticipant) => shootParticipant._id?.toString() === participantId,
  );

  if (!participant) {
    return zeroMatchResult();
  }

  const round = participant.scores.find(
    (participantScore: IDenormalizedScore) =>
      participantScore.roundNumber === roundNumber,
  );

  if (!round) {
    return zeroMatchResult();
  }

  round.score = score;
  round.scoredAt = score === null ? null : new Date();

  participant.totalScore = participant.scores.reduce<number>(
    (total, participantScore: IDenormalizedScore) =>
      total + (participantScore.score ?? 0),
    0,
  );
  participant.scoredCount = participant.scores.filter(
    (participantScore: IDenormalizedScore) => participantScore.score !== null,
  ).length;
  shoot.scoredCount = participants.reduce<number>(
    (total, shootParticipant: IDenormalizedParticipant) =>
      total + shootParticipant.scoredCount,
    0,
  );
  shoot.firstScoredAt = getFirstScoredAt(participants);

  await shoot.save();

  return {
    matchedCount: 1,
    modifiedCount: 1,
  };
};
