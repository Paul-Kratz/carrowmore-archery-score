import { connectMongoose } from "@/lib/mongoose";
import { RoundScore, Shoot, ShootParticipant } from "@/models/mongoose";

export async function deleteShoot(shootId: string) {
  await connectMongoose();

  await RoundScore.deleteMany({ shoot: shootId }).exec();
  await ShootParticipant.deleteMany({ shoot: shootId }).exec();
  await Shoot.deleteOne({ _id: shootId }).exec();
}
