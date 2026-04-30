"use client";

import { GuestBadge } from "@/components/shared/GuestBadge";
import { getUserLabel } from "@/helpers/getUserLabel";
import { IShootParticipantWithScores, IUser } from "@/models";
import { Button } from "@radix-ui/themes";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ParticipantSelectorProps = {
  currentStation: number;
  currentUserId: string;
  disabled?: boolean;
  onNextParticipant: () => void;
  onPreviousParticipant: () => void;
  onSelect: (participantId: string) => void;
  participants: IShootParticipantWithScores[];
  selectedParticipantId: string | null;
};

export function ParticipantSelector({
  currentStation,
  currentUserId,
  disabled = false,
  onNextParticipant,
  onPreviousParticipant,
  onSelect,
  participants,
  selectedParticipantId,
}: ParticipantSelectorProps) {
  const selectedParticipant =
    participants.find((participant) => participant.id === selectedParticipantId) ??
    participants[0] ??
    null;
  const currentScore = selectedParticipant
    ? selectedParticipant.roundScores[currentStation - 1]
    : null;
  if (!selectedParticipant) {
    return null;
  }

  return (
    <section className="mx-2 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-border bg-[var(--card)]/95 p-2 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <Button
          aria-label="Previous participant"
          className="shrink-0"
          disabled={disabled}
          onClick={onPreviousParticipant}
          size="2"
          variant="surface"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-center font-bold leading-tight">
            <span className="truncate text-base">
              {getUserLabel(selectedParticipant.userInfo as IUser, currentUserId)}
            </span>
            {selectedParticipant.userInfo.isGuest && <GuestBadge />}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md bg-[#edf4e9] px-2 py-1">
              <span className="mr-1 text-[10px] font-bold uppercase text-muted-foreground">
                Total
              </span>
              <span className="text-sm font-bold text-[var(--club-red-dark)]">
                {selectedParticipant.totalScore}
              </span>
            </div>
            <div className="rounded-md bg-[#edf4e9] px-2 py-1">
              <span className="mr-1 text-[10px] font-bold uppercase text-muted-foreground">
                Round
              </span>
              <span className="text-sm font-bold text-[var(--forest)]">
                {currentScore ?? "-"}
              </span>
            </div>
          </div>
        </div>

        <Button
          aria-label="Next participant"
          className="shrink-0"
          disabled={disabled}
          onClick={onNextParticipant}
          size="2"
          variant="surface"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-2 flex max-w-full min-w-0 gap-2 overflow-x-auto pb-1">
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
                  ? "border-[var(--club-red-dark)] bg-[#e2ecd0] shadow-sm"
                  : participantStationScore !== null
                    ? "border-[var(--forest)] bg-[#edf4e9]"
                    : "border-border bg-background"
              }`}
            >
              <div className="truncate text-xs font-bold">
                {participantLabel}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] leading-tight">
                <span className="font-bold text-[var(--club-red-dark)]">
                  Total {participant.totalScore}
                </span>
                <span className="font-bold text-[var(--forest)]">
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
