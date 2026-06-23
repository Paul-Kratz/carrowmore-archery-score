import { CLUBS } from "@/constants";

export const formatSummaryDate = (timestamp: number, withTime: boolean) => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: withTime ? "short" : undefined,
  }).format(date);
};

export const getClubScoreValues = (clubId: string) =>
  Array.from(
    new Set([
      ...CLUBS[clubId].scoringRows.flatMap((row) =>
        row.scores.map(({ score }) => score),
      ),
      0,
    ]),
  );
