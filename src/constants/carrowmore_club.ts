import { ClubData } from "@/models";

const SCORING_ROWS = [
  {
    label: "1st arrow",
    peg: "Furthest peg",
    scores: [
      {
        score: 20,
        result: "Kill",
      },
      {
        score: 16,
        result: "Wound",
      },
    ],
  },
  {
    label: "2nd arrow",
    peg: "Middle peg",
    scores: [
      {
        score: 14,
        result: "Kill",
      },
      {
        score: 10,
        result: "Wound",
      },
    ],
  },
  {
    label: "3rd arrow",
    peg: "Closest peg",
    scores: [
      {
        score: 8,
        result: "Kill",
      },
      {
        score: 4,
        result: "Wound",
      },
    ],
  },
] as const;

export const carrowmoreArcheryClub: ClubData = {
  id: "carrowmore",
  name: "Carrowmore Archery",
  totalStations: 18,
  pegColors: ["red", "yellow"],
  scoringRows: SCORING_ROWS,
};
