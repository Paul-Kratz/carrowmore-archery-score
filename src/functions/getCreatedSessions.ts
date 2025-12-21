import { prisma } from "@/lib/prisma";

export const getCreatedSessions = async (userId: string) => {
  try {
    const sessions = await prisma.archerySession.findMany({
      where: {
        createdById: userId,
      },
    });

    return sessions;
  } catch (e: unknown) {
    console.log(e);
  }
};
