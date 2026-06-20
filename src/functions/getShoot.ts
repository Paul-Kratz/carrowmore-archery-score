import { formatResponse } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { IDenormalizedParticipant } from "@/models";
import { ShootDenormalized } from "@/models/denormalized/mongoose";
import { Types } from "mongoose";

type ShootAccessParticipant = {
  user?: Types.ObjectId | { _id?: Types.ObjectId | string } | null;
};

export const getShoot = async ({ shootId }: { shootId: string }) => {
  await connectMongoose();

  const shoot = await ShootDenormalized.findById(shootId)
    .populate({
      path: "participants.user",
      select: "name email",
    })
    .lean();

  return formatResponse(shoot);
};

export const getShootWithAccess = async ({
  shootId,
  userId,
}: {
  shootId: string;
  userId: string;
}) => {
  await connectMongoose();

  const shoot = await ShootDenormalized.findById(shootId)
    .populate({
      path: "participants.user",
      select: "name email",
    })
    .lean();

  if (!shoot) {
    return {
      exists: false,
      isCreator: false,
      isParticipant: false,
      shoot: null,
    };
  }

  const isCreator = shoot.createdBy.toString() === userId;
  const isParticipant = shoot.participants.some(
    (participant: IDenormalizedParticipant) => {
      const participantUser = (participant as ShootAccessParticipant).user;

      if (!participantUser) {
        return false;
      }

      return participantUser instanceof Types.ObjectId
        ? participantUser.toString() === userId
        : participantUser._id?.toString() === userId;
    },
  );

  return {
    exists: true,
    isCreator,
    isParticipant,
    shoot,
  };
};
