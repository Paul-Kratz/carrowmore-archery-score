import { connectMongoose } from "@/lib/mongoose";
import { RoundScore } from "@/models/mongoose";
import { Types } from "mongoose";

export const updateRound = async (
  userId: string,
  shootId: string,
  roundNumber: number,
  score: number,
) => {
  try {
    await connectMongoose();
    const res = await RoundScore.updateOne(
      {
        user: new Types.ObjectId(userId),
        shoot: new Types.ObjectId(shootId),
        roundNumber,
      },
      { score },
    );
    return res;
  } catch (e: unknown) {
    console.log(e);
  }
};
