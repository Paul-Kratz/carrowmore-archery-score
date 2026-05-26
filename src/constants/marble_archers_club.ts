import { ClubData } from "@/models";

const SCORING_ROWS = [
  {
    label: "1st arrow",
    scores: [
      {
        score: 20,
        result: "Kill",
      },
      {
        score: 18,
        result: "Wound",
      },
    ],
  },
  {
    label: "2nd arrow",
    scores: [
      {
        score: 16,
        result: "Kill",
      },
      {
        score: 14,
        result: "Wound",
      },
    ],
  },
  {
    label: "3rd arrow",
    scores: [
      {
        score: 12,
        result: "Kill",
      },
      {
        score: 10,
        result: "Wound",
      },
    ],
  },
] as const;

export const marbleArchersClub: ClubData = {
  id: "marble_archers",
  name: "Marble Archers",
  totalStations: 14,
  pegColors: ["yellow", "blue", "black"],
  scoringRows: SCORING_ROWS,
};
