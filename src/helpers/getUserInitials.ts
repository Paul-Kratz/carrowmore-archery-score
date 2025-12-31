import { User } from "@prisma-local/client";

export const getUserInitials = (user?: User) => {
  const nameToUse = user?.name || user?.email;

  if (!nameToUse) return "";

  return nameToUse
    .match(/(^\S\S?|\s\S)?/g)
    ?.map((v) => v.trim())
    .join("")
    .match(/(^\S|\S$)?/g)
    ?.join("")
    .toLocaleUpperCase();
};

export const getRandomBackgroundColor = () => {
  const colours = [
    "primary",
    "accent",
    "neutral",
    "info",
    "success",
    "warning",
    "error",
  ];
  const indexToUse = Math.floor(Math.random() * (6 - 0 + 1) + 0);

  return `bg-${colours[indexToUse]}`;
};
