"use client";

import { ACTIVE_SHOOT_COOKIE, CLUBS, getClubPegColors } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import {
  getParticipantDisplayName,
  MAX_GUEST_NAME_LENGTH,
  normalizeParticipantName,
} from "@/helpers/participantDisplay";
import { IShoot, IUser, ShootParticipantInput } from "@/models";
import { Button } from "@radix-ui/themes";
import { History, Sprout, TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { AddUsernameDialog } from "@/components/pages/setup/AddUsernameDialog";
import { ForestLoader } from "@/components/shared/ForestLoader";
import {
  ParticipantsCard,
  SetupParticipant,
} from "./setup/ParticipantsCard";
import { Header } from "../shared/Header";
import { ClubSelectorCard } from "./setup/ClubSelectorCard";

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
            getParticipantDisplayName(participant, currentUser.id),
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
      (participant) => participant.id !== id || participant.id === currentUser.id,
    );
    setParticipants(updatedParticipants);
  };

  const createNewShoot = async () => {
    if (isCreatingShoot) {
      return;
    }

    setIsCreatingShoot(true);
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

      const newShoot = formatResponse<IShoot>(await response.json()) as IShoot;

      Cookies.set(ACTIVE_SHOOT_COOKIE, newShoot.id);

      router.push(`/shoot/${newShoot.id}/1`);
    } finally {
      setIsCreatingShoot(false);
    }
  };

  return (
    <div className="forest-page bg-background min-h-screen">
      <Header
        title="In the Forest"
        subtitle="Setup your shoot"
        showBackButton={false}
      />
      <main className="container max-w-2xl mx-auto px-4 py-5 pb-28">
        <div className="mb-5 rounded-2xl border border-border bg-[linear-gradient(135deg,#fbf7e8,#dfe9cb)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-(--deep-forest-green) text-primary-foreground">
              <Sprout className="h-5 w-5 text-(--sage-green)" />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight">
                Start a New Shoot
              </h2>
              <p className="text-sm text-muted-foreground">
                Forest round setup
              </p>
            </div>
          </div>
        </div>

        {activeShootId && (
          <section className="mb-4 rounded-xl border border-(--sage-green)/60 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-(--deep-forest-green)">
                  Active shoot
                </h3>
                <p className="text-sm text-muted-foreground">
                  Continue scoring your current round.
                </p>
              </div>
              <Button
                variant="surface"
                onClick={() => router.push(`/shoot/${activeShootId}/1`)}
                disabled={isCreatingShoot}
              >
                Resume Shoot
              </Button>
            </div>
          </section>
        )}

        <div className="space-y-4">
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
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-(--card)/95 px-4 py-3 shadow-[0_-10px_24px_rgba(30,38,28,0.12)] backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-[1fr_auto] gap-3">
          <Button
            onClick={createNewShoot}
            disabled={!canStartShoot}
            size="4"
            className="forest-primary-button"
            style={{ width: "100%" }}
          >
            {isCreatingShoot ? (
              <ForestLoader label="Starting shoot" size="sm" tone="light" />
            ) : (
              <>
                <TreePine className="w-5 h-5 mr-1" />
                Start Shoot
              </>
            )}
          </Button>
          <Button
            variant="surface"
            onClick={() => router.push("/history")}
            size="4"
            aria-label="History"
            disabled={isCreatingShoot}
          >
            <History className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
