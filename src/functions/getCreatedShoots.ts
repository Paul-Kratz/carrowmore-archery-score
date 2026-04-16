import { formatResponseArray } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { Shoot } from "@/models/mongoose";
import { Types } from "mongoose";

export const getCreatedShoots = async (userId: string) => {
  await connectMongoose();
  const data = await Shoot.aggregate()
    .match({
      createdBy: new Types.ObjectId(userId),
    }) // for shoots created by current user
    .lookup({
      from: "shootparticipants",
      localField: "_id",
      foreignField: "shoot",
      as: "participants",
    })
    // .match({
    //   "participants.user": new Types.ObjectId(userId),
    // }) // for all shoots user participated in
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
        userId: "$participants.user",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$shoot", "$$shootId"] },
                {
                  $or: [
                    { $eq: ["$participant", "$$participantId"] },
                    {
                      $and: [
                        { $ne: ["$$userId", null] },
                        { $eq: ["$user", "$$userId"] },
                      ],
                    },
                  ],
                },
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
