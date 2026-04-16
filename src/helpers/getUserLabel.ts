import { IUser } from "@/models";
import { getParticipantDisplayName } from "./participantDisplay";

export const getUserLabel = (user: IUser, currentUserId: string) => {
  let label = getParticipantDisplayName(user, currentUserId);

  if (user.id === currentUserId && !user.isGuest) {
    label += " (you)";
  }

  return label;
};
