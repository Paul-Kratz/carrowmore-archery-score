"use client";

import { GuestBadge } from "@/components/shared/GuestBadge";
import { getPegColorHex, getPegColorLabel } from "@/constants";
import { useShootContext } from "@/contexts/ShootContext";
import { ShootParticipant } from "@/models";

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
    ) ??
    participants[0] ??
    null;

  if (!selectedParticipant) {
    return null;
  }

  return (
    <section className="mx-2 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-border bg-(--card)/95 p-2 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 justify-center text-center font-bold leading-tight">
            <div className="flex items-center justify-center gap-2">
              <span className="truncate text-base">
                {selectedParticipant.getParticipantLabel()}
              </span>
              {selectedParticipant.isGuest && <GuestBadge />}
            </div>
            <span
              aria-label={`${getPegColorLabel(
                selectedParticipant.pegColor,
              )} peg colour`}
              className="h-3 w-3 shrink-0 rounded-full border border-border"
              style={{
                backgroundColor: getPegColorHex(selectedParticipant.pegColor),
              }}
            />
            <span>|</span>
            <span>Station: {currentStation}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex max-w-full justify-center min-w-0 gap-2 overflow-x-auto pb-1">
        {participants.map((participant) => {
          const participantStationScore =
            participant.getScoreForStation(currentStation);

          return (
            <button
              key={participant.id}
              disabled={disabled}
              onClick={() => onSelect(participant.id)}
              aria-label={`Select ${participant.getParticipantLabel()}`}
              className={`w-28 shrink-0 overflow-hidden rounded-md border px-2 py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                participant.id === selectedParticipantId
                  ? "border-(--deep-forest-green) bg-[#e2ecd0] shadow-sm"
                  : participantStationScore !== null
                    ? "border-(--emerald-green) bg-[#edf4e9]"
                    : "border-border bg-background"
              }`}
            >
              <div className="truncate text-xs font-bold">
                <span
                  aria-hidden="true"
                  className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-border align-[-1px]"
                  style={{
                    backgroundColor: getPegColorHex(participant.pegColor),
                  }}
                />
                {participant.getParticipantLabel()}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] leading-tight">
                <div className="font-bold text-(--deep-forest-green) flex flex-col justify-center">
                  Total
                  <span>{showScores ? participant.totalScore : "-"}</span>
                </div>

                <div className="font-bold text-(--emerald-green) flex flex-col justify-center">
                  Round
                  <span>{participantStationScore ?? "-"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
