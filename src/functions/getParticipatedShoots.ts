import { formatResponseArray } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { Shoot } from "@/models/mongoose";
import { Types } from "mongoose";

export const getParticipatedShoots = async (userId: string) => {
  await connectMongoose();
  const data = await Shoot.aggregate()
    .lookup({
      from: "shootparticipants",
      localField: "_id",
      foreignField: "shoot",
      as: "participants",
    })
    .match({
      "participants.user": new Types.ObjectId(userId),
    }) // for all shoots user participated in
    .unwind("$participants")
    .lookup({
      from: "users",
      localField: "participants.user",
      foreignField: "_id",
      as: "participantUser",
    })
    .addFields({
      "participants.userInfo": {
        $cond: [
          { $gt: [{ $size: "$participantUser" }, 0] },
          {
            $mergeObjects: [
              { $arrayElemAt: ["$participantUser", 0] },
              { isGuest: false },
            ],
          },
          {
            name: "$participants.guestName",
            email: null,
            isGuest: true,
          },
        ],
      },
    })
    .lookup({
      from: "roundscores",
      let: {
        shootId: "$_id",
        participantId: "$participants._id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$shoot", "$$shootId"] },
                { $eq: ["$participant", "$$participantId"] },
              ],
            },
          },
        },
        { $sort: { roundNumber: 1 } },
      ],
      as: "roundScores",
    })
    .addFields({
      "participants.roundScores": {
        $map: {
          input: "$roundScores",
          as: "round",
          in: "$$round.score",
        },
      },
      "participants.totalScore": {
        $sum: "$roundScores.score",
      },
    })
    .group({
      _id: "$_id",
      mode: { $first: "$mode" },
      createdBy: { $first: "$createdBy" },
      completed: { $first: "$completed" },
      notes: { $first: "$notes" },
      participants: { $push: "$participants" },
      createdAt: { $first: "$createdAt" },
    });

  return formatResponseArray(data);
};
