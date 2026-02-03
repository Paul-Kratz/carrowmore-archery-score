import { connectMongoose } from "@/lib/mongoose";
import { Shoot } from "@/models/mongoose";
import { Types } from "mongoose";

export const updateShoot = async ({
  shootId,
  notes,
  completed,
}: {
  shootId: string;
  notes: string;
  completed: boolean;
}) => {
  await connectMongoose();
  await Shoot.updateOne(
    { _id: new Types.ObjectId(shootId) },
    { notes: notes, completed: completed }
  );
};
