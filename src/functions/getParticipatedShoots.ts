import { Shoot } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

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
