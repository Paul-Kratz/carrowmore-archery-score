"use client";

import {
  CLUBS,
  getClubPegColors,
  getPegColorHex,
  getPegColorLabel,
} from "@/constants";
import {
  getParticipantDisplayName,
  getParticipantUserId,
  getUserLabel,
  MAX_GUEST_NAME_LENGTH,
  normalizeParticipantName,
} from "@/helpers/participantDisplay";
import { getNextPegColor } from "@/helpers/pegColors";
import { IUser } from "@/models";
import { Button, Card } from "@radix-ui/themes";
import { Plus, Search, Trash2, UserPlus, UsersRound } from "lucide-react";
import { FormEvent, KeyboardEvent } from "react";

export type SetupParticipant = {
  id: string;
  userId?: string;
  guestName?: string | null;
  name?: string | null;
  email?: string | null;
  isGuest?: boolean;
  pegColor: string;
};

type ParticipantsCardProps = {
  archerQuery: string;
  currentUser: IUser;
  disabled?: boolean;
  onAddGuest: (guestName: string) => void;
  onAddParticipant: (participantId: string) => void;
  onUpdateParticipantPegColor: (
    participantId: string,
    pegColor: string,
  ) => void;
  onArcherQueryChange: (query: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  participants: SetupParticipant[];
  users: IUser[];
  clubId: string;
};

export function ParticipantsCard({
  archerQuery,
  currentUser,
  disabled = false,
  onAddGuest,
  onAddParticipant,
  onUpdateParticipantPegColor,
  onArcherQueryChange,
  onRemoveParticipant,
  participants,
  users,
  clubId,
}: ParticipantsCardProps) {
  const currentUserId = currentUser.id;
  const clubData = CLUBS[clubId];
  const clubPegColors = getClubPegColors(clubData);
  const selectedParticipants = participants;
  const normalizedQuery = normalizeParticipantName(archerQuery);
  const availableUsers = users.filter(
    (user) =>
      !selectedParticipants.some(
        (participant) => (participant.userId ?? participant.id) === user.id,
      ),
  );
  const matchingUsers =
    normalizedQuery.length === 0
      ? []
      : availableUsers
          .filter((user) =>
            normalizeParticipantName(
              getParticipantDisplayName(
                user,
                currentUserId === getParticipantUserId(user),
              ),
            ).includes(normalizedQuery),
          )
          .slice(0, 4);
  const exactMatch = availableUsers.find(
    (user) =>
      normalizeParticipantName(
        getParticipantDisplayName(
          user,
          currentUserId === getParticipantUserId(user),
        ),
      ) === normalizedQuery,
  );
  const canAddGuest =
    archerQuery.trim().length > 0 &&
    archerQuery.trim().length <= MAX_GUEST_NAME_LENGTH &&
    !exactMatch &&
    !selectedParticipants.some(
      (participant) =>
        normalizeParticipantName(
          getParticipantDisplayName(
            participant,
            currentUserId === getParticipantUserId(participant),
          ),
        ) === normalizedQuery,
    );
  const hasSuggestions = matchingUsers.length > 0 || canAddGuest;

  const addRegisteredParticipant = (participantId: string) => {
    onAddParticipant(participantId);
    onArcherQueryChange("");
  };

  const addGuestParticipant = () => {
    if (!canAddGuest) {
      return;
    }

    onAddGuest(archerQuery);
    onArcherQueryChange("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (exactMatch) {
      addRegisteredParticipant(exactMatch.id);
      return;
    }

    addGuestParticipant();
  };

  const handleParticipantPegColorChange = (participant: SetupParticipant) => {
    if (disabled) {
      return;
    }

    onUpdateParticipantPegColor(
      participant.id,
      getNextPegColor(participant.pegColor, clubPegColors),
    );
  };

  const handleParticipantKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    participant: SetupParticipant,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleParticipantPegColorChange(participant);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-(--deep-forest-green) rounded-sm px-4 py-3 text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-(--sage-green)" />
            <h2 className="text-base font-bold">Gather archers</h2>
          </div>
          <span className="rounded-full bg-(--sage-green) px-3 py-1 text-xs font-bold text-primary-foreground">
            {selectedParticipants.length}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <form className="space-y-2" onSubmit={handleSubmit}>
          <label
            htmlFor="archer-search"
            className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            Add archer
          </label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="archer-search"
                aria-label="Add archer by name"
                className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled}
                onChange={(event) => onArcherQueryChange(event.target.value)}
                placeholder="Type a name"
                value={archerQuery}
              />
            </div>
            <Button
              type="submit"
              size="3"
              disabled={disabled || (!exactMatch && !canAddGuest)}
              className="shrink-0 min-w-12 px-3"
              aria-label="Add archer"
            >
              {exactMatch ? (
                <Plus className="w-4 h-4 sm:mr-1" />
              ) : (
                <UserPlus className="w-4 h-4 sm:mr-1" />
              )}
              <span className="sr-only sm:not-sr-only sm:inline">Add</span>
            </Button>
          </div>

          {archerQuery.trim() && hasSuggestions && (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              {matchingUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  disabled={disabled}
                  className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left last:border-b-0 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => addRegisteredParticipant(user.id)}
                >
                  <span className="font-semibold">
                    {getUserLabel(
                      user,
                      currentUserId === getParticipantUserId(user),
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">Member</span>
                </button>
              ))}
              {canAddGuest && (
                <button
                  type="button"
                  disabled={disabled}
                  className="flex w-full items-center justify-between px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={addGuestParticipant}
                >
                  <span className="font-semibold">
                    Add guest &quot;{archerQuery.trim()}&quot;
                  </span>
                  <span className="text-xs text-muted-foreground">Guest</span>
                </button>
              )}
            </div>
          )}
        </form>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Starting line
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              Tap an archer to change peg colour
            </p>
          </div>
          <div className="grid gap-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                aria-disabled={disabled}
                aria-label={`Change ${getParticipantDisplayName(
                  participant,
                  currentUserId === getParticipantUserId(participant),
                )} peg colour, currently ${getPegColorLabel(
                  participant.pegColor,
                )}`}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 shadow-sm border-l-8 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sage-green) ${
                  participant.userId === currentUserId
                    ? "bg-[#eef4d7]"
                    : "bg-card"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-(--deep-forest-green)"}`}
                onClick={() => handleParticipantPegColorChange(participant)}
                onKeyDown={(event) =>
                  handleParticipantKeyDown(event, participant)
                }
                role="button"
                style={{
                  borderLeftColor: getPegColorHex(participant.pegColor),
                }}
                tabIndex={disabled ? -1 : 0}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-semibold">
                    {getParticipantDisplayName(
                      participant,
                      currentUserId === getParticipantUserId(participant),
                    )}
                    {participant.userId === currentUserId &&
                      !participant.isGuest &&
                      " (you)"}
                  </span>
                  {participant.isGuest && (
                    <span className="shrink-0 rounded-full bg-[#dfe9cb] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Guest
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs font-bold text-(--deep-forest-green)">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: getPegColorHex(participant.pegColor),
                      }}
                    />
                    {getPegColorLabel(participant.pegColor)}
                  </span>
                  {participant.userId !== currentUserId && (
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveParticipant(participant.id);
                      }}
                      variant="ghost"
                      size="3"
                      className="text-destructive h-8 w-8 shrink-0 p-0"
                      disabled={disabled}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
