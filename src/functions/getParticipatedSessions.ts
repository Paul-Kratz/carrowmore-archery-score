import { prisma } from "@/lib/prisma";
import { ArcherySession } from "../../generated/prisma/client";

export const getParticipatedSessions = async (
  userId: string
): Promise<ArcherySession[]> => {
  try {
    const sessions = await prisma.archerySession.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: true,
      },
    });

    return sessions;
  } catch (e: unknown) {
    console.error(e);
    return [];
  }
};
