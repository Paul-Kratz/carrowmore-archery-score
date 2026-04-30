import {
  CompetitionRoundKey,
  ICompetitionParticipantWithScores,
} from "@/models";

export const formatCompetitionDate = (date: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export const getCompetitionProgressLabel = (
  participant: ICompetitionParticipantWithScores,
  roundKey: CompetitionRoundKey,
) => `${participant.completed[roundKey]} / 18`;

export const getRoundStatusLabel = (
  participant: ICompetitionParticipantWithScores,
  roundKey: CompetitionRoundKey,
) =>
  participant.completed[roundKey] === 18
    ? "Complete"
    : `${participant.completed[roundKey]} scored`;
