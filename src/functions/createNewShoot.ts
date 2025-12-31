import { NUM_STATIONS } from "@/constants";
import { prisma } from "@/lib/prisma";

// test shoot = { userId: '694515cd2702e65598d6c5f2', mode: 'red', participantIds: ['694515cd2702e65598d6c5f2', '69454dc18b2d4763f5f50611']}
export const createNewShoot = async ({
  userId,
  mode,
  participantIds,
}: {
  userId: string;
  mode: "yellow" | "red";
  participantIds: string[];
}) => {
  // make unique list of participants
  const uniqueParticipants = Array.from(new Set([userId, ...participantIds]));
  // verify all participants exist
  const users = await prisma.user.findMany({
    where: { id: { in: uniqueParticipants } },
    select: { id: true },
  });

  const userIds = users.map((user) => user.id);

  if (userIds.length !== uniqueParticipants.length) {
    throw new Error("One or more participant userIds do not exist");
  }

  const ROUNDS = Array.from({ length: NUM_STATIONS }, (_, i) => i + 1);
  const shoot = await prisma.$transaction(async (tx) => {
    // create shoot
    const shoot = await tx.shoot.create({
      data: {
        mode,
        createdById: userId,
      },
    });
    // create all shoot participants
    await tx.shootParticipant.createMany({
      data: userIds.map((userId) => ({
        shootId: shoot.id,
        userId,
      })),
    });
    // create all round scores
    await tx.roundScore.createMany({
      data: userIds.flatMap((userId) =>
        ROUNDS.map((roundNumber) => ({
          shootId: shoot.id,
          userId,
          roundNumber,
          score: null,
        }))
      ),
    });

    return shoot;
  });
  return shoot;
};
