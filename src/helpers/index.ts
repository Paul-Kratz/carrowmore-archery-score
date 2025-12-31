import { NUM_STATIONS, SCORING_TABLE } from "@/constants";

// Only accept a score included in the scoring table
export const validScore = (score: number) => {
  return SCORING_TABLE.flat().includes(score) || score === 0;
};

// Only accept numbers between 0 & 18 as rounds
export const validRoundNumber = (roundNumber: number) => {
  return roundNumber > 0 && roundNumber <= NUM_STATIONS;
};
