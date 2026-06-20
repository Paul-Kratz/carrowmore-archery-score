import { IDenormalizedParticipantUserInfo, IShootDenormalized } from "@/models";

export const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

export const getTopScorer = (shoot: IShootDenormalized) => {
  if (shoot.participants.length === 0) return null;

  const sorted = [...shoot.participants].sort(
    (participantA, participantB) =>
      participantB.totalScore - participantA.totalScore,
  );

  const topParticipant = sorted[0];

  return {
    name:
      (topParticipant?.user as IDenormalizedParticipantUserInfo)?.name ||
      "Unknown",
    score: topParticipant.totalScore,
    isGuest: Boolean(topParticipant.guestName),
  };
};

export const getUserScore = (
  shoot: IShootDenormalized,
  currentUserId: string,
) => {
  const userParticipant = shoot.participants.find(
    (participant) =>
      (participant?.user as IDenormalizedParticipantUserInfo)?.id ===
      currentUserId,
  );

  if (!userParticipant) return null;

  const completed = userParticipant.scores.filter(
    (score) => score.score !== null,
  ).length;

  return { score: userParticipant.totalScore, completed };
};

export const getUserStanding = (
  shoot: IShootDenormalized,
  currentUserId: string,
) => {
  const userParticipant = shoot.participants.find(
    (participant) =>
      (participant?.user as IDenormalizedParticipantUserInfo)?.id ===
      currentUserId,
  );

  if (!userParticipant) return null;

  const sorted = [...shoot.participants].sort(
    (participantA, participantB) =>
      participantB.totalScore - participantA.totalScore,
  );
  const rank =
    sorted.findIndex((participant) => participant.id === userParticipant.id) +
    1;

  return {
    rank,
    score: userParticipant.totalScore,
    completed: userParticipant.scores.filter((score) => score.score !== null)
      .length,
    participantCount: shoot.participants.length,
  };
};

export const getShootCompletionStats = (shoot: IShootDenormalized) => {
  const participantCount = shoot.participants.length;
  const guestCount = shoot.participants.filter((participant) =>
    Boolean(participant.guestName),
  ).length;
  const totalSlots = participantCount * 18;
  const scoredSlots = shoot.participants.reduce(
    (total, participant) =>
      total + participant.scores.filter((score) => score.score !== null).length,
    0,
  );
  const completedStations =
    participantCount === 0
      ? 0
      : Array.from({ length: 18 }, (_, stationIndex) =>
          shoot.participants.every(
            (participant) => participant.scores[stationIndex]?.score !== null,
          ),
        ).filter(Boolean).length;
  const completionPercent =
    totalSlots === 0 ? 0 : Math.round((scoredSlots / totalSlots) * 100);

  return {
    completedStations,
    completionPercent,
    guestCount,
    participantCount,
    scoredSlots,
    totalSlots,
  };
};

export const formatHistoryDate = (timestamp: number) => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
