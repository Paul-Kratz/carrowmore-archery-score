export type PegColorParticipant = {
  pegColor?: string | null;
};

export const getNextPegColor = (
  currentPegColor: string,
  availablePegColors: string[],
) => {
  if (availablePegColors.length === 0) {
    return currentPegColor;
  }

  const currentColorIndex = availablePegColors.indexOf(currentPegColor);
  const nextColorIndex =
    currentColorIndex === -1
      ? 0
      : (currentColorIndex + 1) % availablePegColors.length;

  return availablePegColors[nextColorIndex];
};

export const getUniqueParticipantPegColors = <
  TParticipant extends PegColorParticipant,
>(
  participants: TParticipant[],
) =>
  Array.from(
    new Set(
      participants
        .map((participant) => participant.pegColor)
        .filter((pegColor): pegColor is string => Boolean(pegColor)),
    ),
  );

export const getParticipantPegColorSummary = <
  TParticipant extends PegColorParticipant,
>(
  participants: TParticipant[],
) => {
  const pegColors = getUniqueParticipantPegColors(participants);

  return { pegColors };
};
