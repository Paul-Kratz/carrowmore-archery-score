import type { IDenormalizedParticipant, IShootDenormalized } from "@/models";

function participantUserId(user: IDenormalizedParticipant["user"]) {
  if (!user) return null;
  if (typeof user === "string") return user;
  if ("_id" in user) return user._id?.toString() ?? null;
  if ("id" in user && typeof user.id === "string") return user.id;
  return user.toString();
}

// Apply only to read responses, never to the document used for score updates.
export function limitShootScoreDetails<T extends IShootDenormalized>(shoot: T, viewerId: string): T {
  if (shoot.createdBy.toString() === viewerId) return shoot;
  return {
    ...shoot,
    participants: shoot.participants.map(participant =>
      !participant.guestName?.trim() && participantUserId(participant.user) === viewerId
        ? participant
        : { ...participant, scores: [], scoreDetailsVisible: false },
    ),
  };
}
