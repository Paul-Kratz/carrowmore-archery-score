import type { IUser } from "@/models";

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
  isCurrentUser: boolean,
) => {
  const name = user.name?.trim();

  if (name) {
    return name;
  }

  return user.email?.trim() || (isCurrentUser ? "You" : "Unnamed archer");
};

export const getParticipantDisplayName = (
  participant: DisplayParticipant,
  isCurrentUser: boolean,
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
    isCurrentUser,
  );
};

export const getUserLabel = (
  participant: DisplayParticipant,
  isCurrentUser: boolean,
) => {
  let label = getParticipantDisplayName(participant, isCurrentUser);

  if (isCurrentUser && !participant.guestName) {
    label += " (you)";
  }

  return label;
};
