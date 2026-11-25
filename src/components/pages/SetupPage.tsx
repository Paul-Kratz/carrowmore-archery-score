"use client";

import { ACTIVE_SHOOT_COOKIE, CLUBS, getClubPegColors } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import {
  getParticipantDisplayName,
  getParticipantUserId,
  MAX_GUEST_NAME_LENGTH,
  normalizeParticipantName,
} from "@/helpers/participantDisplay";
import { IShootDenormalized, IUser, ShootParticipantInput } from "@/models";
import { Button, Theme } from "@radix-ui/themes";
import { ArrowRight, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { AddUsernameDialog } from "@/components/pages/setup/AddUsernameDialog";
import { ForestLoader } from "@/components/shared/ForestLoader";
import { ParticipantsCard, SetupParticipant } from "./setup/ParticipantsCard";
import { ClubSelectorCard } from "./setup/ClubSelectorCard";
import { scorebookTheme } from "../shared/scorebookTheme";
import { oswald } from "@/fonts/oswald";
import { ScorebookHeader } from "../shared/ScorebookHeader";

type SetupPageProps = {
  activeShootId?: string;
  users: IUser[];
  currentUser: IUser;
};

const createRegisteredSetupParticipant = (
  user: IUser,
  pegColor: string,
): SetupParticipant => ({
  id: user.id,
  userId: user.id,
  name: user.name ?? null,
  email: user.email ?? null,
  isGuest: false,
  pegColor,
});

export function SetupPage({
  activeShootId,
  users,
  currentUser,
}: SetupPageProps) {
  const [selectedClub, setSelectedClub] = useState("carrowmore");
  const [participants, setParticipants] = useState<SetupParticipant[]>(() => [
    createRegisteredSetupParticipant(
      currentUser,
      getClubPegColors(CLUBS.carrowmore)[0],
    ),
  ]);
  const [archerQuery, setArcherQuery] = useState("");
  const [isCreatingShoot, setIsCreatingShoot] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  const canStartShoot = Boolean(currentUser?.id) && !isCreatingShoot;
  const defaultPegColor = getClubPegColors(CLUBS[selectedClub])[0];

  const handleClubChange = (clubId: string) => {
    const nextPegColors = getClubPegColors(CLUBS[clubId]);
    const nextDefaultPegColor = nextPegColors[0];

    setSelectedClub(clubId);
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        nextPegColors.includes(participant.pegColor)
          ? participant
          : { ...participant, pegColor: nextDefaultPegColor },
      ),
    );
  };

  const handleAddParticipant = (participantId: string) => {
    const newParticipant = users.find((u) => u.id === participantId);
    if (
      newParticipant &&
      newParticipant.id !== currentUser.id &&
      !participants.find((p) => p.id === newParticipant.id)
    ) {
      setParticipants([
        ...participants,
        createRegisteredSetupParticipant(newParticipant, defaultPegColor),
      ]);
    }
  };

  const handleUpdateParticipantPegColor = (
    participantId: string,
    pegColor: string,
  ) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId
          ? { ...participant, pegColor }
          : participant,
      ),
    );
  };

  const handleAddGuest = (guestName: string) => {
    const trimmedName = guestName.trim();
    const normalizedGuestName = normalizeParticipantName(trimmedName);

    if (!trimmedName || trimmedName.length > MAX_GUEST_NAME_LENGTH) {
      return;
    }

    if (
      [currentUser, ...participants].some(
        (participant) =>
          normalizeParticipantName(
            getParticipantDisplayName(
              participant,
              getParticipantUserId(participant) === currentUser.id &&
                !participant.isGuest,
            ),
          ) === normalizedGuestName,
      )
    ) {
      return;
    }

    setParticipants([
      ...participants,
      {
        id: `guest:${normalizedGuestName}`,
        guestName: trimmedName,
        name: trimmedName,
        email: null,
        isGuest: true,
        pegColor: defaultPegColor,
      },
    ]);
  };

  const handleRemoveParticipant = (id: string) => {
    const updatedParticipants = participants.filter(
      (participant) =>
        participant.id !== id || participant.id === currentUser.id,
    );
    setParticipants(updatedParticipants);
  };

  const createNewShoot = async () => {
    if (isCreatingShoot) {
      return;
    }

    setIsCreatingShoot(true);
    setCreateError(null);
    const shootParticipants: ShootParticipantInput[] = participants.map(
      (participant) =>
        participant.isGuest
          ? {
              guestName: participant.guestName ?? participant.name ?? "",
              pegColor: participant.pegColor,
            }
          : {
              userId: participant.userId ?? participant.id,
              pegColor: participant.pegColor,
            },
    );
    const body = {
      clubId: selectedClub,
      participants: shootParticipants,
    };

    try {
      const response = await fetch("/api/shoot", {
        method: "post",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to create shoot");
      }

      const newShoot = formatResponse<IShootDenormalized>(await response.json());

      Cookies.set(ACTIVE_SHOOT_COOKIE, newShoot.id);

      router.push(`/shoot/${newShoot.id}/1`);
    } catch {
      setCreateError("The shoot couldn’t be started. Check your connection and try again.");
    } finally {
      setIsCreatingShoot(false);
    }
  };

  return (
    <Theme
      accentColor="green"
      grayColor="olive"
      radius="small"
      panelBackground="solid"
      style={scorebookTheme}
      className="flex min-h-dvh flex-col bg-background text-foreground"
    >
      <ScorebookHeader rightSlot={
        <button
          type="button"
          onClick={() => router.push("/history")}
          disabled={isCreatingShoot}
          className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm text-primary-foreground/85 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
        >
          <History aria-hidden="true" className="h-4 w-4" />
          History
        </button>
      } />
      <main className={`mx-auto w-full max-w-2xl flex-1 px-5 pt-8 ${createError ? "pb-44" : "pb-28"} sm:flex-none sm:px-8 sm:pt-12 sm:pb-8`}>
        <div className="mb-8">
          <h1 className={`${oswald.className} text-4xl leading-tight font-normal`}>
            New shoot
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose a club and who’s shooting.
          </p>
        </div>

        {/* Resume a previous active shoot */}
        {activeShootId && (
          <section className="mb-8 border-l-2 border-primary pl-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold">
                  Active shoot
                </h2>
                <p className="text-sm text-muted-foreground">
                  Continue scoring your current round.
                </p>
              </div>
              <Button
                variant="outline"
                size="3"
                className="min-h-11!"
                onClick={() => router.push(`/shoot/${activeShootId}/1`)}
                disabled={isCreatingShoot}
              >
                Resume Shoot
              </Button>
            </div>
          </section>
        )}

        <div className="space-y-8">
          <ClubSelectorCard
            disabled={isCreatingShoot}
            selectedClub={selectedClub}
            onClubChange={handleClubChange}
          />

          <ParticipantsCard
            archerQuery={archerQuery}
            currentUser={currentUser}
            disabled={isCreatingShoot}
            onAddGuest={handleAddGuest}
            onAddParticipant={handleAddParticipant}
            onUpdateParticipantPegColor={handleUpdateParticipantPegColor}
            onArcherQueryChange={setArcherQuery}
            onRemoveParticipant={handleRemoveParticipant}
            participants={participants}
            users={users}
            clubId={selectedClub}
          />
        </div>
        {currentUser && !currentUser.name && <AddUsernameDialog />}
      </main>
      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:px-8 sm:pt-0 sm:pb-12">
        <div className="mx-auto max-w-2xl sm:px-8">
          {createError && <p role="alert" className="mb-3 text-sm leading-relaxed text-red-800">{createError}</p>}
          <Button
            type="button"
            onClick={createNewShoot}
            disabled={!canStartShoot}
            size="4"
            className="w-full! min-h-12! bg-primary! bg-none! font-semibold! text-white! shadow-none! hover:bg-(--deep-forest-green)! disabled:bg-muted! disabled:text-muted-foreground!"
          >
            {isCreatingShoot ? (
              <ForestLoader label="Starting shoot" size="sm" tone="light" />
            ) : (
              <>
                Start Shoot
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </Theme>
  );
}
