export const SCORE_OPTIONS = [
  {
    value: 20,
    label: "20",
    description: "Kill on 1st Arrow",
    color: "bg-green-700 text-white",
  },
  {
    value: 16,
    label: "16",
    description: "Wound on 1st Arrow",
    color: "border border-green-700 bg-green-700/10 text-black/80",
  },
  {
    value: 14,
    label: "14",
    description: "Kill on 2nd Arrow",
    color: "bg-blue-700 text-white",
  },
  {
    value: 10,
    label: "10",
    description: "Wound on 2nd Arrow",
    color: "border border-blue-700 bg-blue-700/10 text-black/80",
  },
  {
    value: 8,
    label: "8",
    description: "Kill on 3rd Arrow",
    color: "bg-orange-500 text-white",
  },
  {
    value: 4,
    label: "4",
    description: "Wound on 3rd Arrow",
    color: "border border-orange-500 bg-orange-500/10 text-black/80",
  },
  {
    value: 0,
    label: "0",
    description: "Missed Shot",
    color: "bg-red-700 text-white",
  },
] as const;
