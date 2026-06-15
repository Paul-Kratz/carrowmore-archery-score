import { formatResponseArray } from "@/helpers/formatResponse";
import { connectMongoose } from "@/lib/mongoose";
import { IShootChartData } from "@/models";
import { ShootDenormalized } from "@/models/denormalized/mongoose";
import { Types } from "mongoose";

export const getShootChartData = async (userId: string) => {
  await connectMongoose();

  const userObjectId = new Types.ObjectId(userId);
  const shoots = await ShootDenormalized.find(
    {
      "participants.userId": userObjectId,
    },
    {
      clubId: 1,
      createdAt: 1,
      completed: 1,
      totalStations: 1,
      participants: {
        $elemMatch: {
          userId: userObjectId,
        },
      },
    },
  )
    .sort({ createdAt: 1 })
    .lean();

  const data = shoots.flatMap(({ participants, ...shoot }) => {
    const participant = participants?.[0];

    if (!participant) {
      return [];
    }

    return [
      {
        ...shoot,
        participant,
      },
    ];
  });

  return formatResponseArray<IShootChartData>(data);
};
