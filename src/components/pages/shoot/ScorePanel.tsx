"use client";

import { getUserLabel } from "@/helpers/getUserLabel";
import { IUser } from "@/models";
import { SCORE_OPTIONS } from "./scoreOptions";

const SCORING_ROWS = [
  {
    label: "1st arrow",
    peg: "Furthest peg",
    scores: [
      { score: 20, result: "Kill" },
      { score: 16, result: "Wound" },
    ],
  },
  {
    label: "2nd arrow",
    peg: "Middle peg",
    scores: [
      { score: 14, result: "Kill" },
      { score: 10, result: "Wound" },
    ],
  },
  {
    label: "3rd arrow",
    peg: "Closest peg",
    scores: [
      { score: 8, result: "Kill" },
      { score: 4, result: "Wound" },
    ],
  },
] as const;

const scoreOptionsByValue = new Map(
  SCORE_OPTIONS.map((option) => [option.value, option]),
);

type ScorePanelProps = {
  currentScore: number | null;
  currentUserId: string;
  disabled?: boolean;
  onClear: () => void;
  onSetScore: (score: number) => void;
  selectedParticipantUser: IUser | null;
};

export function ScorePanel({
  currentScore,
  currentUserId,
  disabled = false,
  onClear,
  onSetScore,
  selectedParticipantUser,
}: ScorePanelProps) {
  const participantLabel = selectedParticipantUser
    ? getUserLabel(selectedParticipantUser, currentUserId)
    : "Unknown participant";

  return (
    <div className="max-w-full overflow-hidden p-2 pt-0">
      <div className="sr-only">
        Score for {participantLabel}
        {selectedParticipantUser?.isGuest ? " guest" : ""}
      </div>
      <div className="max-w-full space-y-2">
        {SCORING_ROWS.map((row) => (
          <div
            key={row.label}
            className="rounded-lg border border-border bg-[var(--card)] p-2"
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[var(--club-red-dark)]">
                {row.label}
              </span>
              <span className="text-muted-foreground">{row.peg}</span>
            </div>
            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
              {row.scores.map(({ score, result }) => {
                const option = scoreOptionsByValue.get(score);

                if (!option) {
                  return null;
                }

                return (
                  <button
                    key={score}
                    disabled={disabled}
                    onClick={() => onSetScore(option.value)}
                    className={`min-h-16 min-w-0 w-full overflow-hidden rounded-lg p-2 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${option.color} ${
                      currentScore === option.value
                        ? "ring-3 ring-offset-2 ring-black/80"
                        : ""
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase opacity-90">
                      {result}
                    </div>
                    <div className="text-3xl font-bold leading-none">
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {(() => {
          const missOption = scoreOptionsByValue.get(0);

          if (!missOption) {
            return null;
          }

          return (
            <button
              disabled={disabled}
              onClick={() => onSetScore(missOption.value)}
              className={`min-h-14 min-w-0 w-full overflow-hidden rounded-lg p-2 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${missOption.color} ${
                currentScore === missOption.value
                  ? "ring-3 ring-offset-2 ring-black/80"
                  : ""
              }`}
            >
              <span className="mr-2 text-sm font-semibold uppercase">Miss</span>
              <span className="text-2xl font-bold leading-none">
                {missOption.label}
              </span>
            </button>
          );
        })()}
        {currentScore !== null && (
          <button
            disabled={disabled}
            onClick={onClear}
            className="min-h-10 min-w-0 w-full overflow-hidden rounded-lg border-2 border-dashed border-[var(--leather)] bg-[var(--card)] p-2 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
