import { connectMongoose } from "@/lib/mongoose";
import { Shoot } from "@/models/mongoose";

type BackfillShootClubIdsResult = {
  matched: number;
  modified: number;
};

export async function backfillShootClubIds(
  clubId = "carrowmore",
): Promise<BackfillShootClubIdsResult> {
  await connectMongoose();

  const result = await Shoot.updateMany(
    {
      $or: [{ clubId: { $exists: false } }, { clubId: null }],
    },
    {
      $set: { clubId },
    },
  );

  return {
    matched: result.matchedCount,
    modified: result.modifiedCount,
  };
}
