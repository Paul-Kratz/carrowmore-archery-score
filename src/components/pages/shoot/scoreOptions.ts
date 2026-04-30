export const SCORE_OPTIONS = [
  {
    value: 20,
    label: "20",
    description: "Kill on 1st Arrow",
    color: "bg-[var(--forest)] text-white border-2 border-[var(--club-gold)] shadow-md",
  },
  {
    value: 16,
    label: "16",
    description: "Wound on 1st Arrow",
    color: "border-2 border-[var(--forest)] bg-[#edf4e9] text-[var(--ink)] shadow-sm",
  },
  {
    value: 14,
    label: "14",
    description: "Kill on 2nd Arrow",
    color: "bg-[var(--club-red)] text-white border-2 border-[var(--club-gold)] shadow-md",
  },
  {
    value: 10,
    label: "10",
    description: "Wound on 2nd Arrow",
    color: "border-2 border-[var(--club-red)] bg-[#f8e9df] text-[var(--ink)] shadow-sm",
  },
  {
    value: 8,
    label: "8",
    description: "Kill on 3rd Arrow",
    color: "bg-[var(--leather)] text-white border-2 border-[var(--club-gold)] shadow-md",
  },
  {
    value: 4,
    label: "4",
    description: "Wound on 3rd Arrow",
    color: "border-2 border-[var(--leather)] bg-[#f4eadb] text-[var(--ink)] shadow-sm",
  },
  {
    value: 0,
    label: "0",
    description: "Missed Shot",
    color: "bg-[#2d211d] text-white border-2 border-[#2d211d] shadow-md",
  },
] as const;
