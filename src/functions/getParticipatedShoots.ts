import { formatResponseArray } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { ShootDenormalized } from "@/models/denormalized/mongoose";
import { Types } from "mongoose";

export const getParticipatedShoots = async (userId: string) => {
  await connectMongoose();

  const shoots = await ShootDenormalized.find({
    "participants.user": new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "participants.user",
      select: "name email",
    })
    .lean();

  return formatResponseArray(shoots);
};
