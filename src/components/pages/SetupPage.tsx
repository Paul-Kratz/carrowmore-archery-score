"use client";

import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { formatResponse } from "@/helpers/formatResponse";
import {
  getParticipantDisplayName,
  MAX_GUEST_NAME_LENGTH,
  normalizeParticipantName,
} from "@/helpers/participantDisplay";
import { IShoot, IUser, Mode } from "@/models";
import { Button } from "@radix-ui/themes";
import { History, Sprout, TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { AddUsernameDialog } from "@/components/pages/setup/AddUsernameDialog";
import { ForestLoader } from "@/components/shared/ForestLoader";
import { ModeSelectorCard } from "./setup/ModeSelectorCard";
import { ParticipantsCard } from "./setup/ParticipantsCard";
import { Header } from "../shared/Header";

type SetupPageProps = {
  users: IUser[];
  currentUser: IUser;
};

export function SetupPage({ users, currentUser }: SetupPageProps) {
  const [mode, setMode] = useState<Mode>(Mode.yellow);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [archerQuery, setArcherQuery] = useState("");
  const [isCreatingShoot, setIsCreatingShoot] = useState(false);
  const router = useRouter();

  const canStartShoot = Boolean(currentUser?.id) && !isCreatingShoot;

  const handleAddParticipant = (participantId: string) => {
    const newParticipant = users.find((u) => u.id === participantId);
    if (
      newParticipant &&
      newParticipant.id !== currentUser.id &&
      !participants.find((p) => p.id === newParticipant.id)
    ) {
      setParticipants([...participants, newParticipant]);
    }
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
        name: trimmedName,
        email: null,
        isGuest: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  };

  const handleRemoveParticipant = (id: string) => {
    const updatedParticipants = participants.filter((p) => p.id !== id);
    setParticipants(updatedParticipants);
  };

  const createNewShoot = async () => {
    if (isCreatingShoot) {
      return;
    }

    setIsCreatingShoot(true);
    const body = {
      mode,
      participantIds: participants
        .filter((participant) => !participant.isGuest)
        .map((participant) => participant.id),
      guestNames: participants
        .filter((participant) => participant.isGuest)
        .map((participant) => participant.name ?? ""),
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

      router.push("/shoot/1");
    } finally {
      setIsCreatingShoot(false);
    }
  };

  return (
    <div className="forest-page bg-background min-h-screen">
      <Header
        title="In the Forest"
        subtitle="Carrowmore Archers"
        showBackButton={false}
      />
      <main className="container max-w-2xl mx-auto px-4 py-5 pb-28">
        <div className="mb-5 rounded-2xl border border-border bg-[linear-gradient(135deg,#fbf7e8,#dfe9cb)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-(--club-red-dark) text-primary-foreground">
              <Sprout className="h-5 w-5 text-(--club-gold)" />
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

        <div className="space-y-4">
          <ModeSelectorCard
            disabled={isCreatingShoot}
            mode={mode}
            onModeChange={setMode}
          />

          <ParticipantsCard
            archerQuery={archerQuery}
            currentUser={currentUser}
            disabled={isCreatingShoot}
            onAddGuest={handleAddGuest}
            onAddParticipant={handleAddParticipant}
            onArcherQueryChange={setArcherQuery}
            onRemoveParticipant={handleRemoveParticipant}
            participants={participants}
            users={users}
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
