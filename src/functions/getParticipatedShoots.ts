import { prisma } from "@/lib/prisma";
import { Shoot } from "../../generated/prisma/client";

export const getParticipatedShoots = async (
  userId: string
): Promise<Shoot[]> => {
  try {
    const shoots = await prisma.shoot.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: true,
      },
    });

    return shoots;
  } catch (e: unknown) {
    console.error(e);
    return [];
  }
};
