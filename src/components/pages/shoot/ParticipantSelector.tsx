"use client";

import { getPegColorHex, getPegColorLabel } from "@/constants";
import { useShootContext } from "@/contexts/ShootContext";
import { ShootParticipant } from "@/models";
import { Check } from "lucide-react";

type ParticipantSelectorProps = {
  currentStation: number;
  disabled?: boolean;
  onSelect: (participantId: string) => void;
  participants: ShootParticipant[];
  selectedParticipantId: string | null;
};

export function ParticipantSelector({
  currentStation,
  disabled = false,
  onSelect,
  participants,
  selectedParticipantId,
}: ParticipantSelectorProps) {
  const { showScores } = useShootContext();
  const selectedParticipant =
    participants.find(
      (participant) => participant.id === selectedParticipantId,
    ) ?? participants[0];

  if (!selectedParticipant) return null;

  return (
    <section aria-label="Archers">
      <div className="grid grid-cols-2 gap-2 min-[380px]:grid-cols-3">
        {participants.map((participant) => {
          const score = participant.getScoreForStation(currentStation);
          const selected = participant.id === selectedParticipant.id;
          return (
            <button
              type="button"
              key={participant.id}
              disabled={disabled}
              onClick={() => onSelect(participant.id)}
              aria-label={`Select ${participant.getParticipantLabel()}`}
              aria-pressed={selected}
              title={participant.getParticipantLabel()}
              className={`min-h-16 min-w-0 rounded-sm border px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 ${
                selected
                  ? "border-foreground bg-foreground text-white"
                  : "border-input bg-card text-foreground hover:border-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <span
                  aria-label={`${getPegColorLabel(participant.pegColor)} peg`}
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/20"
                  style={{
                    backgroundColor: getPegColorHex(participant.pegColor),
                  }}
                />
                <span className="min-w-0 truncate">
                  {participant.displayName}
                </span>
              </span>
              <span className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1">
                  {score !== null ? (
                    <span>
                      Score{" "}
                      <span className="font-semibold tabular-nums">
                        {score}
                      </span>
                    </span>
                  ) : (
                    <span aria-label="No score yet">—</span>
                  )}
                </span>
                {showScores && (
                  <span>
                    Total{" "}
                    <span className="font-semibold tabular-nums">
                      {participant.totalScore}
                    </span>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
