import { connectMongoose } from "@/lib/mongoose";
import { RoundScore } from "@/models/mongoose";
import { Types } from "mongoose";

export const updateRound = async (
  userId: string,
  shootId: string,
  roundNumber: number,
  score: number | null,
) => {
  await connectMongoose();
  return RoundScore.updateOne(
    {
      user: new Types.ObjectId(userId),
      shoot: new Types.ObjectId(shootId),
      roundNumber,
    },
    { score },
  );
};
