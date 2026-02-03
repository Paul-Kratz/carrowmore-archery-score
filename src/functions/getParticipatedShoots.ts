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
      "participants.userInfo": { $arrayElemAt: ["$participantUser", 0] },
    })
    .lookup({
      from: "roundscores",
      let: { shootId: "$_id", userId: "$participants.user" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$shoot", "$$shootId"] },
                { $eq: ["$user", "$$userId"] },
              ],
            },
          },
        },
        { $group: { _id: null, totalScore: { $sum: "$score" } } },
      ],
      as: "scoreSummary",
    })
    .addFields({
      "participants.totalScore": {
        $ifNull: [{ $arrayElemAt: ["$scoreSummary.totalScore", 0] }, 0],
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
