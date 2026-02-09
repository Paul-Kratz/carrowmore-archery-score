import { connectMongoose } from "@/lib/mongoose";
import { RoundScore, Shoot, ShootParticipant, User } from "@/models/mongoose";

export async function cleanupOrphanedRecords() {
  await connectMongoose();

  // Get all valid user IDs
  const validUsers = await User.find({}, { _id: 1 }).lean();
  const validUserIds = validUsers.map((u) => u._id);

  // Find shoots with non-existent creators
  const shootsWithMissingCreators = await Shoot.find({
    createdBy: { $nin: validUserIds },
  }).lean();
  const orphanedShootIds = shootsWithMissingCreators.map((s) => s._id);

  // Delete shoots with missing creators and their associated records
  let deletedShootsWithMissingCreators = 0;
  if (orphanedShootIds.length > 0) {
    await RoundScore.deleteMany({ shoot: { $in: orphanedShootIds } }).exec();
    await ShootParticipant.deleteMany({
      shoot: { $in: orphanedShootIds },
    }).exec();
    const result = await Shoot.deleteMany({
      _id: { $in: orphanedShootIds },
    }).exec();
    deletedShootsWithMissingCreators = result.deletedCount || 0;
  }

  // Get all valid shoot IDs (after deleting shoots with missing creators)
  const validShoots = await Shoot.find({}, { _id: 1 }).lean();
  const validShootIds = validShoots.map((s) => s._id);

  // Delete orphaned RoundScores
  const deletedRoundScores = await RoundScore.deleteMany({
    shoot: { $nin: validShootIds },
  }).exec();

  // Delete orphaned ShootParticipants
  const deletedParticipants = await ShootParticipant.deleteMany({
    shoot: { $nin: validShootIds },
  }).exec();

  return {
    deletedShootsWithMissingCreators,
    deletedRoundScores: deletedRoundScores.deletedCount,
    deletedParticipants: deletedParticipants.deletedCount,
  };
}
