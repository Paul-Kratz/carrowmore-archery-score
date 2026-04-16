import { connectMongoose } from "@/lib/mongoose";
import { RoundScore, ShootParticipant } from "@/models/mongoose";

type BackfillRoundScoreParticipantsResult = {
  scanned: number;
  updated: number;
  unresolved: number;
};

export async function backfillRoundScoreParticipants(): Promise<BackfillRoundScoreParticipantsResult> {
  await connectMongoose();

  const scoresNeedingParticipants = await RoundScore.find(
    {
      $or: [{ participant: { $exists: false } }, { participant: null }],
      user: { $exists: true, $ne: null },
    },
    { _id: 1, shoot: 1, user: 1 },
  ).lean();

  if (scoresNeedingParticipants.length === 0) {
    return { scanned: 0, updated: 0, unresolved: 0 };
  }

  const participantKeys = Array.from(
    new Set(
      scoresNeedingParticipants.map(
        (score) => `${score.shoot.toString()}:${score.user?.toString()}`,
      ),
    ),
  );

  const participants = await ShootParticipant.find(
    {
      $or: participantKeys.map((key) => {
        const [shootId, userId] = key.split(":");
        return { shoot: shootId, user: userId };
      }),
    },
    { _id: 1, shoot: 1, user: 1 },
  ).lean();

  const participantIdsByKey = new Map(
    participants.map((participant) => [
      `${participant.shoot.toString()}:${participant.user?.toString()}`,
      participant._id,
    ]),
  );

  const operations = scoresNeedingParticipants.flatMap((score) => {
    const participantId = participantIdsByKey.get(
      `${score.shoot.toString()}:${score.user?.toString()}`,
    );

    if (!participantId) {
      return [];
    }

    return [
      {
        updateOne: {
          filter: { _id: score._id },
          update: { $set: { participant: participantId } },
        },
      },
    ];
  });

  if (operations.length === 0) {
    return {
      scanned: scoresNeedingParticipants.length,
      updated: 0,
      unresolved: scoresNeedingParticipants.length,
    };
  }

  const result = await RoundScore.bulkWrite(operations);

  return {
    scanned: scoresNeedingParticipants.length,
    updated: result.modifiedCount,
    unresolved: scoresNeedingParticipants.length - operations.length,
  };
}
