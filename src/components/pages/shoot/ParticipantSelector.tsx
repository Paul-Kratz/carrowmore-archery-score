"use client";

import { GuestBadge } from "@/components/shared/GuestBadge";
import { getUserLabel } from "@/helpers/getUserLabel";
import { IShootParticipantWithScores, IUser } from "@/models";

type ParticipantSelectorProps = {
  currentStation: number;
  currentUserId: string;
  disabled?: boolean;
  onSelect: (participantId: string) => void;
  participants: IShootParticipantWithScores[];
  selectedParticipantId: string | null;
};

export function ParticipantSelector({
  currentStation,
  currentUserId,
  disabled = false,
  onSelect,
  participants,
  selectedParticipantId,
}: ParticipantSelectorProps) {
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
                {getUserLabel(
                  selectedParticipant.userInfo as IUser,
                  currentUserId,
                )}
              </span>
              {selectedParticipant.userInfo.isGuest && <GuestBadge />}
            </div>
            <span>|</span>
            <span>Station: {currentStation}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex max-w-full justify-center min-w-0 gap-2 overflow-x-auto pb-1">
        {participants.map((participant) => {
          const participantLabel = getUserLabel(
            participant.userInfo as IUser,
            currentUserId,
          );
          const participantStationScore =
            participant.roundScores[currentStation - 1];

          return (
            <button
              key={participant.id}
              disabled={disabled}
              onClick={() => onSelect(participant.id)}
              aria-label={`Select ${participantLabel}`}
              className={`w-28 shrink-0 overflow-hidden rounded-md border px-2 py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                participant.id === selectedParticipantId
                  ? "border-(--club-red-dark) bg-[#e2ecd0] shadow-sm"
                  : participantStationScore !== null
                    ? "border-(--forest) bg-[#edf4e9]"
                    : "border-border bg-background"
              }`}
            >
              <div className="truncate text-xs font-bold">
                {participantLabel}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] leading-tight">
                <span className="font-bold text-(--club-red-dark)">
                  Total {participant.totalScore}
                </span>
                <span className="font-bold text-(--forest)">
                  Round {participantStationScore ?? "-"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
