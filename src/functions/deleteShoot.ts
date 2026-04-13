import { connectMongoose } from "@/lib/mongoose";
import { RoundScore, Shoot, ShootParticipant } from "@/models/mongoose";
import mongoose, { Types } from "mongoose";

export async function deleteShoot(shootId: string) {
  await connectMongoose();
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const shootObjectId = new Types.ObjectId(shootId);

    await RoundScore.deleteMany({ shoot: shootObjectId }, { session });
    await ShootParticipant.deleteMany({ shoot: shootObjectId }, { session });
    await Shoot.deleteOne({ _id: shootObjectId }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
