import { IShootWithParticipants } from "@/models";

export const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

export const getTopScorer = (shoot: IShootWithParticipants) => {
  if (shoot.participants.length === 0) return null;

  const sorted = [...shoot.participants].sort(
    (participantA, participantB) =>
      participantB.totalScore - participantA.totalScore,
  );

  const topParticipant = sorted[0];

  return {
    name: topParticipant?.userInfo?.name || "Unknown",
    score: topParticipant.totalScore,
  };
};

export const getUserScore = (
  shoot: IShootWithParticipants,
  currentUserId: string,
) => {
  const userParticipant = shoot.participants.find(
    (participant) => participant?.userInfo?.id === currentUserId,
  );

  if (!userParticipant) return null;

  const completed = userParticipant.roundScores.filter(
    (score) => score !== null,
  ).length;

  return { score: userParticipant.totalScore, completed };
};

export const formatHistoryDate = (timestamp: number) => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
