import { IUser } from "@/models";

export const getUserLabel = (user: IUser, currentUserId: string) => {
  let label = user.name?.trim();

  if (!label) {
    label = user.id === currentUserId ? (user.email?.trim() ?? "You") : "Unnamed archer";
  }

  if (user.id === currentUserId) {
    label += " (you)";
  }

  return label;
};
