import { prisma } from "@/lib/prisma";
import data from "./data.json";
import { Mode } from "@prisma-local/enums";
const namesMap: Record<string, string> = {
  Vero: "6952db86d85ed8f6a15c1787",
  Veronika: "6952db86d85ed8f6a15c1787",
  Colin: "6952db72d85ed8f6a15c1783",
  Steph: "69481e8f450283a7faaa9df2",
  Paul: "694515cd2702e65598d6c5f2",
};
export const seedTestData = async () => {
  data.forEach(async (s) => {
    const shoot = await prisma.$transaction(async (tx) => {
      // create shoot
      const shoot = await tx.shoot.create({
        data: {
          mode: s.mode as Mode,
          createdById: "694515cd2702e65598d6c5f2",
          notes: "",
          completed: s.completed,
        },
      });
      // create all shoot participants
      await tx.shootParticipant.createMany({
        data: s.participants.map((participant) => {
          const participantId = namesMap[participant.name];
          return {
            shootId: shoot.id,
            userId: participantId,
          };
        }),
      });
      // create all round scores
      await tx.roundScore.createMany({
        data: s.participants.flatMap((participant) =>
          participant.rounds.map((round, index) => {
            return {
              shootId: shoot.id,
              userId: namesMap[participant.name],
              roundNumber: index + 1,
              score: round,
            };
          })
        ),
      });

      return shoot;
    });
  });
};
