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
import { IUser } from "@/models";
import { Button } from "@radix-ui/themes";
import { Plus, Search, Trash2 } from "lucide-react";
import { FormEvent } from "react";
import { SetupSelect } from "./SetupSelect";

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
  const guestNameTooLong =
    !exactMatch && archerQuery.trim().length > MAX_GUEST_NAME_LENGTH;
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

  return (
    <section
      aria-labelledby="archers-heading"
      className="rounded border border-border p-4 shadow sm:p-5"
    >
      <div className="mb-4 flex items-baseline gap-2">
        <h2 id="archers-heading" className="text-base font-semibold">
          Archers
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          ({selectedParticipants.length})
        </span>
      </div>

      <form data-keyboard-focus className="space-y-2" onSubmit={handleSubmit}>
        <label htmlFor="archer-search" className="sr-only">
          Add archer by name
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="archer-search"
              className="min-h-12 w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-base placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              onChange={(event) => onArcherQueryChange(event.target.value)}
              placeholder="Add an archer by name"
              autoComplete="off"
              aria-invalid={guestNameTooLong}
              aria-describedby="archer-search-help"
              value={archerQuery}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="3"
            disabled={disabled || (!exactMatch && !canAddGuest)}
            className="min-h-12! shrink-0! px-3!"
            aria-label="Add archer"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add
          </Button>
        </div>
        <p
          id="archer-search-help"
          role={guestNameTooLong ? "alert" : undefined}
          className={`text-sm ${guestNameTooLong ? "text-red-800" : "text-muted-foreground"}`}
        >
          {guestNameTooLong
            ? `Guest names must be ${MAX_GUEST_NAME_LENGTH} characters or fewer.`
            : "Find a member or add a guest."}
        </p>

        {archerQuery.trim() && hasSuggestions && (
          <div className="divide-y divide-border rounded-md border border-input bg-card">
            {matchingUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={disabled}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-sm px-3 py-3 text-left hover:bg-background focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => addRegisteredParticipant(user.id)}
              >
                <span className="min-w-0 wrap-anywhere font-medium">
                  {getUserLabel(
                    user,
                    currentUserId === getParticipantUserId(user),
                  )}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  Member
                </span>
              </button>
            ))}
            {canAddGuest && (
              <button
                type="button"
                disabled={disabled}
                className="min-h-12 w-full rounded-sm px-3 py-3 text-left wrap-anywhere hover:bg-background focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={addGuestParticipant}
              >
                Add guest &quot;{archerQuery.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </form>

      {participants.length > 0 && (
        <div className="mt-4 mb-1 grid grid-cols-[minmax(0,1fr)_4rem] items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Name
          </h3>
          <h3 className="w-16 text-center text-sm font-medium text-muted-foreground">
            Peg
          </h3>
        </div>
      )}
      <ul className="divide-y divide-border">
        {participants.map((participant) => {
          const isCurrentUser =
            !participant.isGuest && participant.userId === currentUserId;
          const name = getParticipantDisplayName(participant, isCurrentUser);

          return (
            <li
              key={participant.id}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-1">
                <div className="min-w-0 flex-1">
                  <p className="wrap-anywhere font-medium">
                    {name}
                    {isCurrentUser && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        (you)
                      </span>
                    )}
                  </p>
                  {participant.isGuest && (
                    <p className="text-sm text-muted-foreground">Guest</p>
                  )}
                </div>
                {!isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(participant.id)}
                    aria-label={`Remove ${name}`}
                    disabled={disabled}
                    className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-end">
                <SetupSelect
                  label={`Peg for ${name}`}
                  value={participant.pegColor}
                  disabled={disabled}
                  onValueChange={(pegColor) =>
                    onUpdateParticipantPegColor(participant.id, pegColor)
                  }
                  options={clubPegColors.map((pegColor) => ({
                    value: pegColor,
                    label: `${getPegColorLabel(pegColor)} peg`,
                    color: getPegColorHex(pegColor),
                  }))}
                  colorOnly
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
