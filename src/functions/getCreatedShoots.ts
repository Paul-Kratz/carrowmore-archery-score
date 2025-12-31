import { prisma } from "@/lib/prisma";

export const getCreatedShoots = async (userId: string) => {
  try {
    const shoots = await prisma.shoot.findMany({
      where: {
        createdById: userId,
      },
    });

    return shoots;
  } catch (e: unknown) {
    console.log(e);
  }
};
