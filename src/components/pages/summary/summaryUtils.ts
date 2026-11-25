import { CLUBS } from "@/constants";

export const getClubScoreValues = (clubId: string) =>
  Array.from(
    new Set([
      ...(CLUBS[clubId]?.scoringRows ?? []).flatMap((row) =>
        row.scores.map(({ score }) => score),
      ),
      0,
    ]),
  );
