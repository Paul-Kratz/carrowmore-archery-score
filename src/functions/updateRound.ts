import { prisma } from "@/lib/prisma";

export const updateRound = async (
  userId: string,
  sessionId: string,
  roundNumber: number,
  score: number
) => {
  try {
    const round = await prisma.roundScore.upsert({
      where: {
        sessionId_userId_roundNumber: {
          userId,
          sessionId,
          roundNumber,
        },
      },
      update: {
        score,
      },
      create: {
        score,
        userId,
        sessionId,
        roundNumber,
      },
    });

    return round;
  } catch (e: unknown) {
    console.log(e);
  }
};
