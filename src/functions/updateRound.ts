import { connectMongoose } from "@/lib/mongoose";
import { RoundScore, ShootParticipant } from "@/models/mongoose";
import { Types } from "mongoose";

export const updateRound = async (
  participantId: string,
  shootId: string,
  roundNumber: number,
  score: number | null,
) => {
  await connectMongoose();
  const participant = await ShootParticipant.findById(participantId, {
    _id: 1,
    user: 1,
  }).lean();

  if (!participant) {
    return {
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null,
    };
  }

  return RoundScore.updateOne(
    {
      shoot: new Types.ObjectId(shootId),
      roundNumber,
      $or: [
        {
          participant: new Types.ObjectId(participantId),
        },
        ...(participant.user
          ? [
              {
                user: new Types.ObjectId(participant.user.toString()),
                participant: { $exists: false },
              },
            ]
          : []),
      ],
    },
    {
      $set: {
        score,
        participant: new Types.ObjectId(participantId),
      },
    },
  );
};
