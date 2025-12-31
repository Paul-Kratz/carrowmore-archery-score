import { prisma } from "@/lib/prisma";

type GetRoundScoreProps = {
  userId: string;
  shootId: string;
  roundNumber: number;
};
export const getRoundScore = async ({
  userId,
  shootId,
  roundNumber,
}: GetRoundScoreProps) => {
  try {
    const roundScores = await prisma.roundScore.findMany({
      where: {
        userId,
        shootId,
      },
    });

    // Get score for current round
    const roundScore =
      roundScores.find((round) => round.roundNumber === roundNumber)?.score ||
      0;

    // Get total score for all rounds this shoot
    const totalScore = roundScores.reduce((aggregate, round) => {
      return aggregate + round.score;
    }, 0);

    return {
      roundScore,
      totalScore,
    };
  } catch (e: unknown) {
    console.log(e);
  }
};
