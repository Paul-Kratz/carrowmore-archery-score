import { connectMongoose } from "@/lib/mongoose";
import { ShootDenormalized } from "@/models/denormalized/mongoose";
import { Types } from "mongoose";

export const updateShoot = async ({
  shootId,
  userId,
  notes,
  completed,
}: {
  shootId: string;
  userId: string;
  notes?: string;
  completed?: boolean;
}) => {
  await connectMongoose();

  const update: {
    notes?: string;
    completed?: boolean;
    completedAt?: Date | null;
  } = {};

  if (notes !== undefined) {
    update.notes = notes;
  }

  if (completed !== undefined) {
    update.completed = completed;
    update.completedAt = completed ? new Date() : null;
  }

  return ShootDenormalized.updateOne(
    {
      _id: new Types.ObjectId(shootId),
      createdBy: new Types.ObjectId(userId),
    },
    { $set: update },
  );
};
