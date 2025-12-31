import { prisma } from "@/lib/prisma";

export const getShoot = async ({
  shootId,
  roundNumber,
}: {
  shootId: string;
  roundNumber?: number;
}) => {
  try {
    const shoot = await prisma.shoot.findUnique({
      where: { id: shootId },
      include: {
        createdBy: true,
        participants: {
          include: {
            user: true,
          },
        },
        roundScores: true,
      },
    });

    if (!shoot) throw new Error("shoot not found");

    // totals across all rounds
    const totalsByUserId = new Map<string, number>();
    for (const rs of shoot.roundScores) {
      totalsByUserId.set(
        rs.userId,
        (totalsByUserId.get(rs.userId) ?? 0) + (rs?.score ?? 0)
      );
    }

    // scores just for the currently viewed round
    const roundScoresForRound = shoot.roundScores.filter(
      (rs) => rs.roundNumber === roundNumber
    );

    // participants enriched with totals (and optionally this round's score)
    const participantsWithTotals = shoot.participants.map((p) => {
      const totalScore = totalsByUserId.get(p.userId) ?? 0;
      const thisRoundScore =
        roundScoresForRound.find((rs) => rs.userId === p.userId)?.score ?? null;

      return {
        ...p,
        totalScore,
        thisRoundScore,
      };
    });

    // if you still want the same shape as before:
    return {
      shoot: { ...shoot, roundScores: roundScoresForRound },
      participants: participantsWithTotals,
    };
  } catch (e: unknown) {
    return { error: e };
  }
};
