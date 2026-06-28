import { connectMongoose } from "@/lib/mongoose";
import { ShootDenormalized } from "@/models/mongoose";
import { Types } from "mongoose";

export async function deleteShoot({
  shootId,
  userId,
}: {
  shootId: string;
  userId: string;
}) {
  await connectMongoose();

  return await ShootDenormalized.deleteOne({
    _id: new Types.ObjectId(shootId),
    createdBy: new Types.ObjectId(userId),
  });
}
