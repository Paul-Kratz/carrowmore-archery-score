"use client";

import { getUserLabel } from "@/helpers/getUserLabel";
import { IUser } from "@/models";
import { Button, Card, Select } from "@radix-ui/themes";
import { Trash2 } from "lucide-react";

type ParticipantsCardProps = {
  currentUserId: string;
  newGuestName: string;
  newParticipantId: string;
  onAddGuest: () => void;
  onAddParticipant: () => void;
  onGuestNameChange: (guestName: string) => void;
  onNewParticipantChange: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  participants: IUser[];
  users: IUser[];
};

export function ParticipantsCard({
  currentUserId,
  newGuestName,
  newParticipantId,
  onAddGuest,
  onAddParticipant,
  onGuestNameChange,
  onNewParticipantChange,
  onRemoveParticipant,
  participants,
  users,
}: ParticipantsCardProps) {
  return (
    <Card className="p-6">
      <p className="font-semibold mb-2.5">Who is with you today?</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="col-span-3">
          <Select.Root
            size="3"
            value={newParticipantId}
            onValueChange={onNewParticipantChange}
          >
            <Select.Trigger
              placeholder="Select a participant"
              style={{ width: "100%", minWidth: 0 }}
            />
            <Select.Content>
              {users.map((user) => (
                <Select.Item key={user.id} value={user.id}>
                  {getUserLabel(user, currentUserId)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        <Button
          onClick={onAddParticipant}
          size="3"
          disabled={!newParticipantId.trim()}
          className="col-span-1"
        >
          Add
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="col-span-3">
          <input
            aria-label="Guest name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            onChange={(event) => onGuestNameChange(event.target.value)}
            placeholder="Add a guest by name"
            value={newGuestName}
          />
        </div>
        <Button
          onClick={onAddGuest}
          size="3"
          disabled={!newGuestName.trim()}
          className="col-span-1"
        >
          Add guest
        </Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Guests are tracked only in this shoot and do not get site access.
      </p>

      {participants.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground mb-2">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""} added
          </div>
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {getUserLabel(participant, currentUserId)}
                </span>
                {participant.isGuest && (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Guest
                  </span>
                )}
              </div>
              <Button
                onClick={() => onRemoveParticipant(participant.id)}
                variant="ghost"
                size="3"
                className="text-destructive h-8 w-8 p-0"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
          No participants added yet
        </div>
      )}
    </Card>
  );
}
