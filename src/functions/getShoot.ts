import { formatResponse } from "@/helpers/formatResponse";
import { prisma } from "@/lib/prisma";
import { IRoundScore, IShoot, IShootParticipant } from "@/models";
import { RoundScore, Shoot, ShootParticipant } from "@/models/mongoose";

export const getShoot = async ({
  shootId,
  roundNumber,
}: {
  shootId: string;
  roundNumber?: number;
}) => {
  try {
    const shoot = formatResponse<IShoot>(
      await Shoot.findById(shootId).populate("createdBy").exec()
    ) as IShoot;
    if (!shoot) throw new Error("shoot not found");

    const participants = formatResponse<IShootParticipant>(
      await ShootParticipant.find({ shoot: shoot.id }).populate("user").exec()
    );
    const roundScores = formatResponse<IRoundScore>(
      await RoundScore.find(
        { shoot: shoot.id },
        { roundNumber: 1, score: 1 }
      ).exec()
    );
    if (!shoot) throw new Error("shoot not found");

    return { shoot, participants, roundScores };
    // // totals across all rounds
    // const totalsByUserId = new Map<string, number>();
    // for (const rs of shoot.roundScores) {
    //   totalsByUserId.set(
    //     rs.userId,
    //     (totalsByUserId.get(rs.userId) ?? 0) + (rs?.score ?? 0)
    //   );
    // }

    // // scores just for the currently viewed round
    // const roundScoresForRound = shoot.roundScores.filter(
    //   (rs) => rs.roundNumber === roundNumber
    // );

    // // participants enriched with totals (and optionally this round's score)
    // const participantsWithTotals = shoot.participants.map((p) => {
    //   const totalScore = totalsByUserId.get(p.userId) ?? 0;
    //   const thisRoundScore =
    //     roundScoresForRound.find((rs) => rs.userId === p.userId)?.score ?? null;

    //   return {
    //     ...p,
    //     totalScore,
    //     thisRoundScore,
    //   };
    // });

    // // if you still want the same shape as before:
    // return {
    //   shoot: { ...shoot, roundScores: roundScoresForRound },
    //   participants: participantsWithTotals,
    // };
  } catch (e: unknown) {
    return { error: e };
  }
};
