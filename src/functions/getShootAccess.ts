import { connectMongoose } from "@/lib/mongoose";
import { Shoot, ShootParticipant } from "@/models/mongoose";

export const getShootAccess = async ({
  shootId,
  userId,
}: {
  shootId: string;
  userId: string;
}) => {
  await connectMongoose();

  const [shoot, participant] = await Promise.all([
    Shoot.findById(shootId, { createdBy: 1 }).lean(),
    ShootParticipant.exists({ shoot: shootId, user: userId }),
  ]);

  if (!shoot) {
    return {
      exists: false,
      isCreator: false,
      isParticipant: false,
    };
  }

  return {
    exists: true,
    isCreator: shoot.createdBy?.toString() === userId,
    isParticipant: Boolean(participant),
  };
};
