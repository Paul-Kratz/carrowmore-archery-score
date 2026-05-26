import { RoundScore, Shoot, ShootParticipant } from "@/models/mongoose";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadHistoricalData = async (shoots: any[]) => {
  const session = await mongoose.startSession();
  const stats = {
    shootsCreated: 0,
    participantsCreated: 0,
    roundScoresCreated: 0,
  };

  try {
    session.startTransaction();

    for (const shoot of shoots) {
      const shootDoc = await Shoot.create(
        [
          {
            createdAt: new Date(shoot.createdAt),
            createdBy: new mongoose.Types.ObjectId(shoot.createdBy),
            completed: shoot.completed,
          },
        ],
        { session },
      );
      const shootId = shootDoc[0]._id;
      stats.shootsCreated++;

      for (const participant of shoot.participants) {
        await ShootParticipant.create(
          [
            {
              shoot: shootId,
              user: new mongoose.Types.ObjectId(participant.user),
              pegColor: shoot.mode,
              joinedAt: new Date(participant.joinedAt),
            },
          ],
          { session },
        );
        stats.participantsCreated++;

        for (
          let roundIndex = 0;
          roundIndex < participant.roundScores.length;
          roundIndex++
        ) {
          const roundScore = participant.roundScores[roundIndex];
          await RoundScore.create(
            [
              {
                shoot: shootId,
                user: new mongoose.Types.ObjectId(participant.user),
                roundNumber: roundIndex + 1,
                score: roundScore,
              },
            ],
            { session },
          );
          stats.roundScoresCreated++;
        }
      }
    }

    await session.commitTransaction();
    return stats;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
