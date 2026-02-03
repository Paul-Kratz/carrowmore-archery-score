import { NUM_STATIONS } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { IShoot } from "@/models";
import { User, Shoot, ShootParticipant, RoundScore } from "@/models/mongoose";
import { Types } from "mongoose";

export const createNewShoot = async ({
  userId,
  mode,
  participantIds,
}: {
  userId: string;
  mode: "yellow" | "red";
  participantIds: string[];
}) => {
  await connectMongoose();
  // make unique list of participants
  const uniqueParticipants = Array.from(new Set([userId, ...participantIds]));
  // verify all participants exist
  const users = await User.find(
    { _id: { $in: uniqueParticipants.map((id) => new Types.ObjectId(id)) } },
    { _id: 1 }
  );
  const userIds = users.map((user) => user._id.toString());

  if (userIds.length !== uniqueParticipants.length) {
    throw new Error("One or more participant userIds do not exist");
  }

  const ROUNDS = Array.from({ length: NUM_STATIONS }, (_, i) => i + 1);

  // Create shoot
  const shootDoc = await Shoot.create({
    mode,
    createdBy: new Types.ObjectId(userId),
    completed: false,
  });

  // Create all shoot participants
  await ShootParticipant.insertMany(
    userIds.map((uid) => ({
      shoot: shootDoc._id,
      user: new Types.ObjectId(uid),
      joinedAt: new Date(),
    }))
  );

  // Create all round scores
  await RoundScore.insertMany(
    userIds.flatMap((uid) =>
      ROUNDS.map((roundNumber) => ({
        shoot: shootDoc._id,
        user: new Types.ObjectId(uid),
        roundNumber,
        score: null,
      }))
    )
  );

  return formatResponse<IShoot>(shootDoc);
};
