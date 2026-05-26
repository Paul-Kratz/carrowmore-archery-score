"use client";

import { getPegColorHex, getPegColorLabel } from "@/constants";
import { Dot } from "recharts";

type PegScoreDotProps = {
  cx?: number;
  cy?: number;
  payload?: {
    pegColor?: string | null;
    score?: number | null;
  };
};

export const PegScoreDot = ({ cx, cy, payload }: PegScoreDotProps) => {
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  if (payload?.score === null || payload?.score === undefined) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={getPegColorHex(payload.pegColor)}
      stroke="#fbf7e8"
      strokeWidth={2}
    />
  );
};

type PegScoreTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    value?: number | null;
    payload?: {
      pegColor?: string | null;
    };
  }>;
};

export const PegScoreTooltip = ({
  active,
  label,
  payload,
}: PegScoreTooltipProps) => {
  if (!active || !payload?.length) return null;

  const score = payload[0]?.value;
  const pegColor = payload[0]?.payload?.pegColor;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <div className="font-semibold text-(--club-red-dark)">{label}</div>
      <div className="text-muted-foreground">
        {score ?? "No score"} points
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs uppercase text-muted-foreground">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: getPegColorHex(pegColor) }}
        />
        {getPegColorLabel(pegColor)} peg
      </div>
    </div>
  );
};
