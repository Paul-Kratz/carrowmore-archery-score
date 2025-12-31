import { prisma } from "@/lib/prisma";
import { getRoundScore } from "./getRoundScore";

export const updateRound = async (
  userId: string,
  shootId: string,
  roundNumber: number,
  score: number
) => {
  try {
    await prisma.roundScore.upsert({
      where: {
        shootId_userId_roundNumber: {
          userId,
          shootId,
          roundNumber,
        },
      },
      update: {
        score,
      },
      create: {
        score,
        userId,
        shootId,
        roundNumber,
      },
    });

    const round = await getRoundScore({
      userId,
      shootId,
      roundNumber,
    });

    return round;
  } catch (e: unknown) {
    console.log(e);
  }
};
