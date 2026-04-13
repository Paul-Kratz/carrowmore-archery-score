export const POSSIBLE_SCORES = [0, 4, 8, 10, 14, 16, 20];

export const formatSummaryDate = (timestamp: number, withTime: boolean) => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: withTime ? "short" : undefined,
  }).format(date);
};

export const getColourForScore = (score: number | null) => {
  if (score === null) return "text-gray-500";
  if (score >= 16) return "text-green-700";
  if (score >= 10) return "text-blue-700";
  if (score >= 4) return "text-orange-500";
  if (score === 0) return "text-red-600";
  return "text-gray-500";
};

export const getScoreCounts = (roundScores: (number | null)[]) => {
  const counts = new Map<number, number>();
  POSSIBLE_SCORES.forEach((score) => counts.set(score, 0));

  roundScores.forEach((score) => {
    if (score !== null && counts.has(score)) {
      counts.set(score, counts.get(score)! + 1);
    }
  });

  return counts;
};
