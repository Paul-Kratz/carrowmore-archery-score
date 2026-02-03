import { IUser } from "@/models";

export const getUserLabel = (user: IUser, currentUserId: string) => {
  let label = user.name;

  if (!label) {
    label = user.email;
  }

  if (user.id === currentUserId) {
    label += " (you)";
  }

  return label;
};
