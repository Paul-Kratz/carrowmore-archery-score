import { MAX_GUEST_NAME_LENGTH } from "@/helpers/participantDisplay";
import { isValidObjectId } from "@/helpers/isValidObjectId";
import { ShootParticipantInput } from "@/models";

export const PARTICIPANT_IDENTITY_ERROR =
  "Participants must have exactly one identity";
export const PARTICIPANT_PEG_COLOR_ERROR =
  "Participant peg colors are not supported by the selected club";

export const CREATE_SHOOT_VALIDATION_ERRORS = new Set([
  "Guest names cannot be empty",
  "Guest names must be unique",
  "Guest names cannot match selected registered participant names",
  "One or more participant userIds do not exist",
  `Guest names must be ${MAX_GUEST_NAME_LENGTH} characters or fewer`,
  PARTICIPANT_IDENTITY_ERROR,
  PARTICIPANT_PEG_COLOR_ERROR,
]);

export const normalizePegColor = ({
  pegColor,
  defaultPegColor,
  allowedPegColors,
}: {
  pegColor?: string;
  defaultPegColor: string;
  allowedPegColors: string[];
}) => {
  const normalizedPegColor = pegColor?.trim() || defaultPegColor;

  if (!allowedPegColors.includes(normalizedPegColor)) {
    throw new Error(PARTICIPANT_PEG_COLOR_ERROR);
  }

  return normalizedPegColor;
};

export const isShootParticipantInput = (
  participant: unknown,
  allowedPegColors: string[],
): participant is ShootParticipantInput => {
  if (!participant || typeof participant !== "object") {
    return false;
  }

  const input = participant as ShootParticipantInput;
  const hasUserId =
    typeof input.userId === "string" && isValidObjectId(input.userId);
  const hasGuestName =
    typeof input.guestName === "string" && input.guestName.trim().length > 0;

  if (hasUserId === hasGuestName) {
    return false;
  }

  try {
    normalizePegColor({
      pegColor: input.pegColor,
      defaultPegColor: allowedPegColors[0],
      allowedPegColors,
    });
  } catch {
    return false;
  }

  return true;
};
