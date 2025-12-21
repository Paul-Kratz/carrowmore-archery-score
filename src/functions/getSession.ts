import { prisma } from "@/lib/prisma";

export const getSession = async ({
  sessionId,
  includeParticipants,
}: {
  sessionId: string;
  includeParticipants: boolean;
}) => {
  try {
    const session = await prisma.archerySession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        participants: includeParticipants,
      },
    });

    return session;
  } catch (e: unknown) {
    console.log(e);
  }
};
