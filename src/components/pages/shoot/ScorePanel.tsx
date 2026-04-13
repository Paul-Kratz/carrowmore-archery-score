"use client";

import { getUserLabel } from "@/helpers/getUserLabel";
import { IUser } from "@/models";
import { SCORE_OPTIONS } from "./scoreOptions";

type ScorePanelProps = {
  currentScore: number | null;
  currentUserId: string;
  onClear: () => void;
  onSetScore: (score: number) => void;
  selectedParticipantUser: IUser | null;
};

export function ScorePanel({
  currentScore,
  currentUserId,
  onClear,
  onSetScore,
  selectedParticipantUser,
}: ScorePanelProps) {
  const participantLabel = selectedParticipantUser
    ? getUserLabel(selectedParticipantUser, currentUserId)
    : "Unknown participant";

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-3">
        <div className="text-md font-bold">Score for {participantLabel}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SCORE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSetScore(option.value)}
            className={`p-3 rounded-lg ${option.color} ${
              currentScore === option.value ? "ring-3 ring-offset-2 ring-black/80" : ""
            }`}
          >
            <div className="text-2xl font-bold">{option.label}</div>
            <div className="text-sm opacity-90 mt-1">{option.description}</div>
          </button>
        ))}
        {currentScore !== null && (
          <button
            onClick={onClear}
            className="p-3 rounded-lg border-2 border-dashed border-muted-foreground/50"
          >
            Clear Score
          </button>
        )}
      </div>
    </div>
  );
}
