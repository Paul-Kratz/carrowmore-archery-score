import { formatResponse } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { IShoot, IShootParticipantWithScores } from "@/models";
import { Shoot } from "@/models/mongoose";
import { Types } from "mongoose";

export const getShoot = async ({ shootId }: { shootId: string }) => {
  await connectMongoose();
  const data = await Shoot.aggregate()
    .match({
      _id: new Types.ObjectId(shootId),
    })
    .lookup({
      from: "shootparticipants",
      localField: "_id",
      foreignField: "shoot",
      as: "participants",
    })
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
        { $group: { _id: null, totalScore: { $sum: "$score" } } },
      ],
      as: "scoreSummary",
    })
    .addFields({
      "participants.totalScore": {
        $ifNull: [{ $arrayElemAt: ["$scoreSummary.totalScore", 0] }, 0],
      },
    })
    // Add roundScores array for each participant
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
        { $project: { score: 1, _id: 0 } },
      ],
      as: "participantRoundScores",
    })
    .addFields({
      "participants.roundScores": {
        $ifNull: [
          {
            $map: {
              input: "$participantRoundScores",
              as: "rs",
              in: "$$rs.score",
            },
          },
          [],
        ],
      },
    })
    .lookup({
      from: "roundscores",
      let: {
        shootId: "$_id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$shoot", "$$shootId"] },
                { $ne: ["$score", null] },
                { $ne: ["$scoredAt", null] },
              ],
            },
          },
        },
        { $sort: { scoredAt: 1 } },
        { $limit: 1 },
        { $project: { scoredAt: 1, _id: 0 } },
      ],
      as: "firstScoredRound",
    })
    .group({
      _id: "$_id",
      mode: { $first: "$mode" },
      createdBy: { $first: "$createdBy" },
      completed: { $first: "$completed" },
      notes: { $first: "$notes" },
      participants: { $push: "$participants" },
      createdAt: { $first: "$createdAt" },
      firstScoredAt: {
        $first: { $arrayElemAt: ["$firstScoredRound.scoredAt", 0] },
      },
    });

  return formatResponse<
    IShoot & { participants: IShootParticipantWithScores[] }
  >(data[0]);
};
