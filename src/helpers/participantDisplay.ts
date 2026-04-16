import { IUser } from "@/models";

export const MAX_GUEST_NAME_LENGTH = 50;

export const normalizeParticipantName = (name: string) =>
  name.trim().toLowerCase();

export const getRegisteredParticipantDisplayName = (
  user: Pick<IUser, "id" | "name" | "email">,
  currentUserId: string,
) => {
  const name = user.name?.trim();

  if (name) {
    return name;
  }

  if (user.id === currentUserId) {
    return user.email?.trim() || "You";
  }

  return "Unnamed archer";
};

export const getParticipantDisplayName = (
  user: Pick<IUser, "id" | "name" | "email" | "isGuest">,
  currentUserId: string,
) => {
  if (user.isGuest) {
    return user.name?.trim() || "Guest archer";
  }

  return getRegisteredParticipantDisplayName(user, currentUserId);
};
