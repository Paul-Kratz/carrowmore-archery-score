"use client";

import { getUserLabel } from "@/helpers/getUserLabel";
import { IUser } from "@/models";
import { CLUBS } from "@/constants";

type ScorePanelProps = {
  currentScore: number | null;
  currentUserId: string;
  disabled?: boolean;
  onClear: () => void;
  onSetScore: (score: number) => void;
  selectedParticipantUser: IUser | null;
  clubId: string;
};

const SCORE_ROW_PALETTE = [
  { solid: "#2F5D43", tint: "#E4EFE7" },
  { solid: "#8C8F57", tint: "#F0F1DD" },
  { solid: "#A5402D", tint: "#F6E5DF" },
  { solid: "#3D6F86", tint: "#E1EEF3" },
  { solid: "#6F4F8C", tint: "#ECE5F2" },
];

export function getScoreButtonTheme(rowIndex: number, optionIndex: number) {
  const palette = SCORE_ROW_PALETTE[rowIndex % SCORE_ROW_PALETTE.length];
  const isPrimaryResult = optionIndex === 0;

  return {
    backgroundColor: isPrimaryResult ? palette.solid : palette.tint,
    borderColor: palette.solid,
    color: isPrimaryResult ? "#fff" : "var(--charcoal-green)",
  };
}

export function ScorePanel({
  currentScore,
  currentUserId,
  disabled = false,
  onClear,
  onSetScore,
  selectedParticipantUser,
  clubId = "carrowmore",
}: ScorePanelProps) {
  const participantLabel = selectedParticipantUser
    ? getUserLabel(selectedParticipantUser, currentUserId)
    : "Unknown participant";

  const clubData = CLUBS[clubId];

  return (
    <div className="max-w-full overflow-hidden p-2 pt-0">
      <div className="sr-only">
        Score for {participantLabel}
        {selectedParticipantUser?.isGuest ? " guest" : ""}
      </div>
      <div className="max-w-full space-y-2">
        {clubData.scoringRows.map((row, rowIndex) => (
          <div
            key={row.label}
            className="rounded-lg border border-border bg-card p-2"
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-(--deep-forest-green)">
                {row.label}
              </span>
              {row.peg && (
                <span className="text-muted-foreground">{row.peg}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {row.scores.map(({ score, result }, optionIndex) => {
                return (
                  <button
                    key={score}
                    disabled={disabled}
                    onClick={() => onSetScore(score)}
                    className={`min-h-16 min-w-0 w-full rounded-lg p-2 border-2 ${
                      currentScore === score
                        ? "ring-3 ring-offset-2 ring-black/80"
                        : ""
                    }`}
                    style={getScoreButtonTheme(rowIndex, optionIndex)}
                  >
                    <div className="text-xs font-semibold uppercase opacity-90">
                      {result}
                    </div>
                    <div className="text-3xl font-bold leading-none">
                      {score}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {(() => {
          return (
            <button
              disabled={disabled}
              onClick={() => onSetScore(0)}
              className={`min-h-14 min-w-0 w-full overflow-hidden rounded-lg p-2 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 bg-[#2d211d] text-white border-2 border-[#2d211d] ${
                currentScore === 0 ? "ring-3 ring-offset-2 ring-black/80" : ""
              }`}
            >
              <span className="mr-2 text-sm font-semibold uppercase">Miss</span>
              <span className="text-2xl font-bold leading-none">0</span>
            </button>
          );
        })()}
        {currentScore !== null && (
          <button
            disabled={disabled}
            onClick={onClear}
            className="min-h-10 min-w-0 w-full overflow-hidden rounded-lg border-2 border-dashed border-(--warm-brown) bg-card p-2 text-sm font-semibold text-(--charcoal-green) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
