import { ClubData, Mode } from "@/models";

const SCORING_ROWS = [
  {
    label: "1st arrow",
    peg: "Furthest peg",
    scores: [
      {
        score: 20,
        result: "Kill",
        color: "bg-[#2F5D43] border-[#2F5D43] text-white",
      },
      {
        score: 16,
        result: "Wound",
        color: "border-[#2F5D43] text-[var(--ink)]",
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
        color: "bg-[#9A9B73] text-white border-[#9A9B73]",
      },
      {
        score: 10,
        result: "Wound",
        color: "border-[#9A9B73] text-[var(--ink)]",
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
        color: "bg-[#A5402D] text-white border-[#A5402D]",
      },
      {
        score: 4,
        result: "Wound",
        color: "border-[#A5402D] text-[var(--ink)]",
      },
    ],
  },
] as const;

export const carrowmoreArcheryClub: ClubData = {
  id: "carrowmore",
  name: "Carrowmore Archery",
  totalStations: 18,
  modes: [Mode.red, Mode.yellow],
  scoringRows: SCORING_ROWS,
};
