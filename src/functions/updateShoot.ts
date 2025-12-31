import { prisma } from "@/lib/prisma";

export const updateShoot = async ({
  shootId,
  notes,
  completed,
}: {
  shootId: string;
  notes: string;
  completed: boolean;
}) => {
  try {
    const shoot = await prisma.shoot.update({
      where: {
        id: shootId,
      },
      data: {
        notes,
        completed,
      },
    });

    return shoot;
  } catch (e: unknown) {
    console.log(e);
  }
};
