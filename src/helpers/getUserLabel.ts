import {
  DisplayParticipant,
  getParticipantDisplayName,
  getParticipantUserId,
  getShootParticipantDisplayName,
  getShootParticipantUserId,
} from "./participantDisplay";
import type { IDenormalizedParticipant } from "@/models";

export const getUserLabel = (
  participant: DisplayParticipant,
  currentUserId: string,
) => {
  let label = getParticipantDisplayName(participant, currentUserId);

  if (
    getParticipantUserId(participant) === currentUserId &&
    !participant.guestName
  ) {
    label += " (you)";
  }

  return label;
};

export const getShootParticipantLabel = (
  participant: IDenormalizedParticipant,
  currentUserId: string,
) => {
  let label = getShootParticipantDisplayName(participant, currentUserId);

  if (
    getShootParticipantUserId(participant) === currentUserId &&
    !participant.guestName
  ) {
    label += " (you)";
  }

  return label;
};
