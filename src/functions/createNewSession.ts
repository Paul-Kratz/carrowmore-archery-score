import { NUM_STATIONS } from "@/constants";
import { prisma } from "@/lib/prisma";

// test session = { userId: '694515cd2702e65598d6c5f2', mode: 'red', participantIds: ['694515cd2702e65598d6c5f2', '69454dc18b2d4763f5f50611']}
export const createNewSession = async ({
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
  const session = await prisma.$transaction(async (tx) => {
    // create session
    const session = await tx.archerySession.create({
      data: {
        mode,
        createdById: userId,
      },
    });
    // create all session participants
    await tx.sessionParticipant.createMany({
      data: userIds.map((userId) => ({
        sessionId: session.id,
        userId,
      })),
    });
    // create all round scores
    await tx.roundScore.createMany({
      data: userIds.flatMap((userId) =>
        ROUNDS.map((roundNumber) => ({
          sessionId: session.id,
          userId,
          roundNumber,
          score: 0, // or null if you prefer
        }))
      ),
    });

    return session;
  });
  return session;
};
