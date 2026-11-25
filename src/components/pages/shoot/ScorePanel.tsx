"use client";

import { ShootParticipant } from "@/models";
import { CLUBS } from "@/constants";
import { Check } from "lucide-react";

type ScorePanelProps = {
  currentScore: number | null;
  disabled?: boolean;
  onClear: () => void;
  onSetScore: (score: number) => void;
  selectedParticipantUser: ShootParticipant | null;
  clubId: string;
};

export function ScorePanel({
  currentScore,
  disabled = false,
  onClear,
  onSetScore,
  selectedParticipantUser,
  clubId = "carrowmore",
}: ScorePanelProps) {
  const clubData = CLUBS[clubId];
  const resultClass = (selected: boolean) =>
    `relative flex min-h-16 w-full min-w-0 items-center justify-center gap-2 rounded-sm border px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 ${
      selected ? "border-foreground bg-foreground text-white" : "border-input bg-card hover:border-foreground"
    }`;

  return (
    <section aria-label={`Score for ${selectedParticipantUser?.getParticipantLabel() ?? "archer"}`} className="space-y-4">
      {clubData.scoringRows.map((row) => (
        <fieldset key={row.label} className="min-w-0">
          <legend className="mb-2 w-full text-sm">
            <span className="flex flex-wrap justify-between gap-x-2 gap-y-1">
              <span className="font-semibold">{row.label}</span>
              {row.peg && <span className="text-muted-foreground">{row.peg}</span>}
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {row.scores.map(({ score, result }) => (
              <button
                type="button"
                key={score}
                disabled={disabled}
                onClick={() => onSetScore(score)}
                aria-pressed={currentScore === score}
                className={resultClass(currentScore === score)}
              >
                <span className="text-3xl font-semibold tabular-nums">{score}</span>
                <span className="text-sm">{result}</span>
                {currentScore === score && <Check aria-hidden="true" className="absolute right-1 top-1 h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSetScore(0)}
        aria-pressed={currentScore === 0}
        className={resultClass(currentScore === 0)}
      >
        <span className="text-2xl font-semibold tabular-nums">0</span>
        <span className="text-sm">Miss</span>
        {currentScore === 0 && <Check aria-hidden="true" className="h-4 w-4" />}
      </button>
      {currentScore !== null && (
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="min-h-11 w-full rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Clear score
        </button>
      )}
    </section>
  );
}
