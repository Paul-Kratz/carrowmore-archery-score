"use client";

import { GuestBadge } from "@/components/shared/GuestBadge";
import { getUserLabel } from "@/helpers/getUserLabel";
import { IShootParticipantWithScores, IUser } from "@/models";

type ParticipantSelectorProps = {
  currentStation: number;
  currentUserId: string;
  onSelect: (participantId: string) => void;
  participants: IShootParticipantWithScores[];
  selectedParticipantId: string | null;
};

export function ParticipantSelector({
  currentStation,
  currentUserId,
  onSelect,
  participants,
  selectedParticipantId,
}: ParticipantSelectorProps) {
  return (
    <div className="p-2">
      <div className="text-sm font-medium mb-2">Select Participant</div>
      <div className="flex flex-wrap gap-2">
        {participants.map((participant) => (
          <button
            key={participant.id}
            onClick={() => onSelect(participant.id)}
            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
              participant.id === selectedParticipantId
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <span>{getUserLabel(participant.userInfo as IUser, currentUserId)}</span>
              {participant.userInfo.isGuest && <GuestBadge />}
            </div>

            <div className="text-xs text-muted-foreground mt-0.5">
              Score: {participant.roundScores[currentStation - 1] ?? "-"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
