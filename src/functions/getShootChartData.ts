import { formatResponseArray } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { Shoot } from "@/models/mongoose";
import { Types } from "mongoose";

export const getShootChartData = async (userId: string) => {
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
    .match({ "participants.user": new Types.ObjectId(userId) })
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
      clubId: { $first: "$clubId" },
      pegColor: { $first: "$participants.pegColor" },
      createdAt: { $first: "$createdAt" },
      roundScores: { $first: "$participants.roundScores" },
      totalScore: { $first: "$participants.totalScore" },
    });

  return formatResponseArray(data);
};
