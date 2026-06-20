import type { IDenormalizedParticipant, IUser } from "@/models";

export const MAX_GUEST_NAME_LENGTH = 50;

export const normalizeParticipantName = (name: string) =>
  name.trim().toLowerCase();

export type DisplayParticipant = {
  id: string;
  userId?: string | null;
  guestName?: string | null;
  name?: string | null;
  email?: string | null;
  isGuest?: boolean;
};

export const getParticipantUserId = (participant: DisplayParticipant) =>
  participant.userId ?? participant.id;

export const getRegisteredParticipantDisplayName = (
  user: Pick<IUser, "id" | "name" | "email">,
  currentUserId: string,
) => {
  const name = user.name?.trim();

  if (name) {
    return name;
  }

  return (
    user.email?.trim() ||
    (user.id === currentUserId ? "You" : "Unnamed archer")
  );
};

export const getParticipantDisplayName = (
  participant: DisplayParticipant,
  currentUserId: string,
) => {
  const guestName = participant.guestName?.trim();

  if (participant.isGuest || guestName) {
    return guestName || participant.name?.trim() || "Guest archer";
  }

  return getRegisteredParticipantDisplayName(
    {
      id: getParticipantUserId(participant),
      name: participant.name,
      email: participant.email,
    },
    currentUserId,
  );
};

export const getShootParticipantUserId = (
  participant: IDenormalizedParticipant,
) => {
  if (typeof participant.user === "string") {
    return participant.user;
  }

  if (
    participant.user &&
    ("name" in participant.user || "email" in participant.user)
  ) {
    return participant.user.id;
  }

  return participant.user ? String(participant.user) : null;
};

export const getShootParticipantDisplayName = (
  participant: IDenormalizedParticipant,
  currentUserId: string,
) => {
  const guestName = participant.guestName?.trim();

  if (guestName) {
    return guestName;
  }

  if (
    participant.user &&
    typeof participant.user === "object" &&
    ("name" in participant.user || "email" in participant.user)
  ) {
    const name = participant.user.name?.trim();

    if (name) {
      return name;
    }

    return (
      participant.user.email?.trim() ||
      (participant.user.id === currentUserId ? "You" : "Unnamed archer")
    );
  }

  return getShootParticipantUserId(participant) === currentUserId
    ? "You"
    : "Unnamed archer";
};
